#!/usr/bin/env python3
"""Conservative, static editorial lint. Not a sanitizer or browser-security proof."""
import hashlib
import json
import math
import os
import re
import secrets
import stat
import sys
from html.parser import HTMLParser

MAX_BYTES = 1024 * 1024
MAX_NODES = 12000
MAX_DEPTH = 96
MAX_NUMBER = 1000000
CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
CSP_META = '<meta http-equiv="Content-Security-Policy" content="' + CSP + '">'
LIMITS = [
    'Conservative static editorial lint; not a sanitizer, browser-security proof, or typed Archify validation.',
    'Does not verify chart math, factual accuracy, arbitrary CSS layout, rendered visibility, overlap, contrast, accessibility, or visual polish.',
    'Browser and visual review remain untested. Open only separately reviewed, delivered HTML.',
    'Publication requires POSIX no-follow directory handles and same-directory hard links; unsupported filesystems fail closed.',
    'Delivery uses an exact read snapshot and atomic no-clobber publication; it does not lock concurrent source editors or promise crash durability.',
]
HTML = set('html head body title meta style main header footer section article aside div span p h1 h2 h3 h4 h5 h6 ul ol li dl dt dd figure figcaption strong em b i small code pre blockquote table caption thead tbody tfoot tr th td br hr'.split())
SVG = set('svg g defs title desc rect circle ellipse line polyline polygon path text tspan use marker clippath lineargradient radialgradient stop'.split())
VOID = {'meta', 'br', 'hr'}
GLOBAL = set('id class style role aria-label aria-labelledby aria-describedby lang dir tabindex'.split())
SVG_ATTR = set('x y x1 y1 x2 y2 cx cy r rx ry width height dx dy d points transform viewbox preserveaspectratio fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity color font-family font-size font-weight font-style text-anchor dominant-baseline alignment-baseline letter-spacing word-spacing textlength lengthadjust marker-start marker-mid marker-end clip-path vector-effect paint-order'.split())
SPECIFIC = {
    'html': {'xmlns'}, 'meta': {'charset', 'name', 'content', 'http-equiv'}, 'style': {'type', 'media'},
    'svg': {'xmlns', 'xmlns:xlink', 'version', 'data-archify-editorial'}, 'use': {'href', 'xlink:href'},
    'marker': set('markerwidth markerheight refx refy orient markerunits'.split()),
    'clippath': {'clippathunits'},
    'lineargradient': set('gradientunits gradienttransform spreadmethod href xlink:href'.split()),
    'radialgradient': set('gradientunits gradienttransform spreadmethod fx fy fr href xlink:href'.split()),
    'stop': {'offset', 'stop-color', 'stop-opacity'}, 'th': {'scope', 'colspan', 'rowspan'},
    'td': {'colspan', 'rowspan'}, 'ol': {'start'}, 'li': {'value'},
}
NUMERIC = set('x y x1 y1 x2 y2 cx cy r rx ry width height dx dy refx refy markerwidth markerheight fx fy fr stroke-width stroke-miterlimit stroke-dashoffset font-size letter-spacing word-spacing textlength'.split())
POSITIVE = set('width height r rx ry markerwidth markerheight stroke-width font-size textlength'.split())
PROPS = set('color color-scheme background background-color background-image font font-family font-size font-style font-weight font-variant line-height letter-spacing word-spacing text-align text-transform text-decoration text-overflow white-space overflow-wrap word-break hyphens display visibility opacity width min-width max-width height min-height max-height aspect-ratio margin margin-top margin-right margin-bottom margin-left padding padding-top padding-right padding-bottom padding-left border border-top border-right border-bottom border-left border-color border-width border-style border-radius box-sizing box-shadow outline outline-offset position top right bottom left inset z-index overflow overflow-x overflow-y float clear vertical-align list-style list-style-type list-style-position border-collapse border-spacing table-layout caption-side grid grid-template-columns grid-template-rows grid-template-areas grid-auto-columns grid-auto-rows grid-auto-flow grid-column grid-row gap row-gap column-gap align-items align-content align-self justify-items justify-content justify-self place-items flex flex-direction flex-wrap flex-flow flex-grow flex-shrink flex-basis order fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset text-anchor dominant-baseline paint-order vector-effect marker-start marker-mid marker-end clip-path transform transform-origin transform-box stop-color stop-opacity break-before break-after break-inside page-break-before page-break-after page-break-inside print-color-adjust -webkit-print-color-adjust'.split())
FUNCTIONS = set('var calc min max clamp rgb rgba hsl hsla linear-gradient radial-gradient repeating-linear-gradient repeating-radial-gradient translate translatex translatey scale scalex scaley rotate skew skewx skewy matrix repeat minmax fit-content'.split())
ID = re.compile(r'[A-Za-z_][A-Za-z0-9_.:-]{0,127}\Z')
NUMBER = r'[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?'
NUM_RE = re.compile(NUMBER)
PLACEHOLDER = re.compile(r'\b(?:placeholder|lorem\s+ipsum|todo|tbd|your\s+(?:title|text|label|description)|(?:insert|replace|add)\s+(?:title|text|label|description)|sample\s+(?:title|text|description)|untitled)\b|\[\s*(?:title|description|label)\s*\]', re.I)

class Reject(Exception):
    pass

def require(condition, message):
    if not condition:
        raise Reject(message)

def meaningful(value, minimum=8):
    value = ' '.join(value.split())
    return len(value) >= minimum and len(re.findall(r'[^\W\d_]', value, re.U)) >= 3 and not PLACEHOLDER.search(value) and value.lower() not in {'title', 'description', 'diagram', 'chart', 'example', 'sample', 'text', 'label'}

def numbers(value, name, positive=False, units=False):
    parts = re.split(r'[\s,]+', value.strip())
    require(0 < len(parts) <= 4096, 'Invalid numeric list: ' + name)
    result = []
    for part in parts:
        match = re.fullmatch('(' + NUMBER + ')' + (r'(?:px|em|rem|%|pt)?' if units else ''), part)
        require(match is not None, 'Invalid finite numeric value: ' + name)
        number = float(match.group(1))
        require(math.isfinite(number) and abs(number) <= MAX_NUMBER, 'Geometry exceeds finite bounds: ' + name)
        require(not positive or number >= 0, 'Negative geometry size: ' + name)
        result.append(number)
    return result

def css_clean(value):
    require('\\' not in value and '\x00' not in value and '<' not in value, 'CSS escapes or ambiguous markup are not supported')
    # Remove only complete CSS comments. Stray delimiters fail closed.
    value = re.sub(r'/\*(?:(?!\*/).)*\*/', '', value, flags=re.S)
    require('/*' not in value and '*/' not in value, 'Unclosed CSS comment')
    require(not re.search(r'@(?:import|font-face)|(?:expression|binding|behavior|javascript|vbscript)\s*[:(]|(?:https?|data|file)\s*:', value, re.I), 'CSS resource or active construct rejected')
    return value

def split_css(value, delimiter):
    parts, start, stack, quote = [], 0, [], None
    for index, char in enumerate(value):
        if quote:
            if char == quote:
                quote = None
            continue
        if char in "\"'":
            quote = char
        elif char in '([':
            stack.append(char)
        elif char in ')]':
            require(stack and stack.pop() == ( '(' if char == ')' else '['), 'Unbalanced CSS value')
        elif char == delimiter and not stack:
            parts.append(value[start:index]); start = index + 1
    require(not stack and quote is None, 'Unclosed CSS string or value')
    parts.append(value[start:])
    return parts

def css_declarations(value, refs):
    value = css_clean(value)
    require(not any(char in value for char in '{}@'), 'Nested or at-rule CSS declarations rejected')
    for declaration in split_css(value, ';'):
        if not declaration.strip():
            continue
        require(':' in declaration, 'Malformed CSS declaration')
        prop, val = declaration.split(':', 1)
        prop, val = prop.strip().lower(), val.strip()
        require(prop in PROPS or re.fullmatch(r'--[a-zA-Z_][a-zA-Z0-9_-]*', prop), 'Unsupported CSS property: ' + prop)
        require(val and len(val) <= 8192, 'Missing or oversized CSS value')
        # A small lexical subset, not CSS/browser equivalence. Resource functions
        # are never accepted merely because an unknown property would be ignored.
        require(not re.search(r'[^\w\s\-+.,%#!:()/\[\]"\'=*|]', val, re.U), 'Unsupported CSS value syntax')
        for match in re.finditer(r'([\w-]+)\s*\(', val):
            function = match.group(1).lower()
            if function == 'url':
                tail = val[match.end():]
                ref = re.match('\\s*(["\']?)(#[A-Za-z_][A-Za-z0-9_.:-]{0,127})\\1\\s*\\)', tail)
                require(ref is not None, 'Only fragment CSS url() references are allowed')
                refs.append((ref.group(2)[1:], 'css'))
            else:
                require(function in FUNCTIONS, 'Unsupported CSS function: ' + function)
        if prop in {'font-size','line-height'}:
            require(not re.fullmatch(r'[+-]?0+(?:\.0+)?(?:px|em|rem|pt|%)?\s*(?:!important)?', val, re.I), 'Zero-sized text rejected')
        if prop in {'color','fill'}:
            require(not re.search(r'\btransparent\b', val, re.I), 'Transparent text/paint rejected')
        if prop == 'display':
            require(not re.search(r'\bnone\b', val, re.I), 'Hidden display:none content rejected')
        if prop == 'visibility':
            require(not re.search(r'\b(hidden|collapse)\b', val, re.I), 'Hidden visibility content rejected')
        if prop in {'opacity', 'fill-opacity', 'stroke-opacity'}:
            literal = re.fullmatch('(' + NUMBER + r')(%?)\s*(?:!important)?', val, re.I)
            if literal:
                require(0 < float(literal.group(1)) <= (100 if literal.group(2) else 1), 'Zero or invalid opacity rejected')
        for num in NUM_RE.finditer(val):
            # Bound number-like tokens outside names/colors. This is a resource
            # bound, not an arbitrary layout correctness check.
            before = val[num.start()-1] if num.start() else ''
            if before and (before.isalpha() or before in '#_-'):
                continue
            require(math.isfinite(float(num.group())) and abs(float(num.group())) <= MAX_NUMBER, 'CSS number exceeds finite bounds')

def css_sheet(value, refs, depth=0):
    require(depth < 12, 'CSS nesting too deep')
    value = css_clean(value).strip()
    index = 0
    while index < len(value):
        while index < len(value) and value[index].isspace():
            index += 1
        if index == len(value):
            break
        opening = value.find('{', index)
        require(opening >= 0, 'CSS rule missing block')
        selector = value[index:opening].strip()
        require(selector, 'CSS rule missing selector')
        nesting, quote, closing = 1, None, opening + 1
        while closing < len(value) and nesting:
            char = value[closing]
            if quote:
                if char == quote: quote = None
            elif char in '"\'': quote = char
            elif char == '{': nesting += 1
            elif char == '}': nesting -= 1
            closing += 1
        require(nesting == 0 and quote is None, 'Unclosed CSS rule')
        body = value[opening+1:closing-1]
        if selector.lower().startswith('@media '):
            require(re.fullmatch(r'@media [\w\s():.,/%<>=+\-]+', selector, re.I) is not None, 'Unsupported media condition')
            css_sheet(body, refs, depth + 1)
        else:
            require('@' not in selector and re.fullmatch('[\\w\\s.#*:>+~,()\\[\\]="\'|^$\\-]+', selector) is not None, 'Unsupported CSS selector or at-rule')
            css_declarations(body, refs)
        index = closing


def path_data(value):
    matches = list(re.finditer(r'[MmZzLlHhVvCcSsQqTtAa]|' + NUMBER, value))
    end = 0
    for match in matches:
        require(not value[end:match.start()].strip(' ,\t\r\n'), 'Unparsed SVG path syntax')
        end = match.end()
    require(not value[end:].strip(' ,\t\r\n'), 'Unparsed SVG path syntax')
    tokens = [m.group() for m in matches]
    require(tokens and tokens[0] in {'M','m'}, 'SVG path must start with moveto')
    arity = {'m':2,'z':0,'l':2,'h':1,'v':1,'c':6,'s':4,'q':4,'t':2,'a':7}
    index = 0
    while index < len(tokens):
        command = tokens[index]
        require(command.lower() in arity, 'SVG path command required')
        index += 1
        start = index
        while index < len(tokens) and tokens[index].lower() not in arity:
            numbers(tokens[index], 'path'); index += 1
        count = index - start
        size = arity[command.lower()]
        require((count == 0 if size == 0 else count >= size and count % size == 0), 'SVG path argument count mismatch')
        if command.lower() == 'a':
            for pos in range(start, index, 7):
                require(float(tokens[pos]) >= 0 and float(tokens[pos+1]) >= 0 and tokens[pos+3] in {'0','1'} and tokens[pos+4] in {'0','1'}, 'Invalid SVG arc arguments')

def transform_data(value):
    arity = {'matrix':{6},'translate':{1,2},'scale':{1,2},'rotate':{1,3},'skewX':{1},'skewY':{1}}
    for command, values in re.findall(r'([A-Za-z]+)\s*\(([^()]*)\)', value):
        require(len(numbers(values, 'transform')) in arity[command], 'SVG transform argument count mismatch')

class Editorial(HTMLParser):
    def __init__(self, source, delivered=False):
        super().__init__(convert_charrefs=False)
        self.source, self.delivered = source, delivered
        self.line_offsets = [0] + [m.end() for m in re.finditer('\n', source)]
        self.stack, self.nodes, self.ids, self.refs = [], [], {}, []
        self.doctype = False
        self.head_end = None
        self.csp_count = 0

    def handle_decl(self, decl):
        require(decl.lower() == 'doctype html' and not self.doctype and not self.nodes, 'Only one leading HTML doctype is supported')
        self.doctype = True

    def unknown_decl(self, data):
        raise Reject('XML/CDATA declarations are not supported')

    def handle_pi(self, data):
        raise Reject('Processing instructions are not supported')

    def handle_comment(self, data):
        line, column = self.getpos()
        offset = self.line_offsets[line-1] + column
        require(self.source[offset:offset+len(data)+7] == '<!--' + data + '-->', 'Ambiguous comment delimiter')
        require('--' not in data and '<' not in data and '>' not in data, 'Ambiguous HTML comment')

    def handle_starttag(self, tag, attrs):
        self.start(tag, attrs, False)

    def handle_startendtag(self, tag, attrs):
        self.start(tag, attrs, True)

    def start(self, tag, attrs, self_closing):
        raw = self.get_starttag_text()
        require(self.doctype, 'Explicit leading <!doctype html> required')
        require(len(self.nodes) < MAX_NODES and len(self.stack) < MAX_DEPTH, 'HTML node/depth bound exceeded')
        require(re.fullmatch('<[A-Za-z][A-Za-z0-9:-]*(?:\\s+[A-Za-z_:][A-Za-z0-9_.:-]*\\s*=\\s*(?:"[^"<>]*"|\'[^\'<>]*\'))*\\s*/?>', raw) is not None, 'Attributes must be quoted; ambiguous HTML syntax rejected')
        parent = self.stack[-1] if self.stack else None
        in_svg = tag == 'svg' or bool(parent and parent['svg'])
        allowed = SVG if in_svg else HTML
        require(tag in allowed, 'Unsupported element: ' + tag)
        require(not (tag == 'svg' and parent and parent['svg']), 'Nested SVG is not supported')
        require(not self_closing or in_svg or tag in VOID, 'Self-closing non-void HTML is ambiguous')
        if parent is None:
            require(tag == 'html' and not self.nodes, 'Exactly one explicit HTML root required')
        else:
            ptag = parent['tag']
            require(ptag not in {'title', 'desc', 'style'}, 'Markup inside title/desc/style rejected')
            if ptag == 'html': require(tag in {'head', 'body'}, 'HTML root may contain only head/body')
            if ptag == 'head': require(tag in {'title', 'meta', 'style'}, 'Unsupported head content')
            if tag in {'head', 'body'}: require(ptag == 'html', 'Misplaced head/body')
            if tag in {'meta', 'style'}: require(ptag == 'head', 'Meta/style must be directly inside head')
            if tag == 'svg': require(not any(n['tag'] == 'head' for n in self.stack), 'SVG belongs in body')
            if not in_svg:
                if tag == 'title': require(ptag == 'head', 'HTML title belongs in head')
                if ptag == 'p': require(tag in {'span','strong','em','b','i','small','code','br'}, 'Block content in p would cause HTML repair')
                if ptag in {'span','strong','em','b','i','small','code','h1','h2','h3','h4','h5','h6'}: require(tag in {'span','strong','em','b','i','small','code','br'}, 'Non-phrasing content would cause HTML repair')
                if ptag in {'ul','ol'}: require(tag == 'li', 'List may contain only li')
                if tag == 'li': require(ptag in {'ul','ol'}, 'Misplaced li')
                if ptag == 'dl': require(tag in {'dt','dd'}, 'dl may contain only dt/dd')
                if tag in {'dt','dd'}: require(ptag == 'dl', 'Misplaced dt/dd')
                if ptag == 'table': require(tag in {'caption','thead','tbody','tfoot'}, 'Explicit table sections required')
                if tag in {'caption','thead','tbody','tfoot'}: require(ptag == 'table', 'Misplaced table section')
                if ptag in {'thead','tbody','tfoot'}: require(tag == 'tr', 'Table section may contain only tr')
                if tag == 'tr': require(ptag in {'thead','tbody','tfoot'}, 'Misplaced tr')
                if ptag == 'tr': require(tag in {'th','td'}, 'tr may contain only cells')
                if tag in {'th','td'}: require(ptag == 'tr', 'Misplaced table cell')
        without_entities = re.sub(r'&(?:amp|lt|gt|quot|apos|nbsp|#[0-9]+|#[xX][0-9a-fA-F]+);', '', raw)
        require('&' not in without_entities, 'Unknown or ambiguous attribute entity')
        for entity in re.findall(r'&#([xX][0-9a-fA-F]+|[0-9]+);', raw):
            code = int(entity[1:], 16) if entity.lower().startswith('x') else int(entity)
            require(32 <= code <= 0x10ffff and not 0xd800 <= code <= 0xdfff and code != 127, 'Invalid/control attribute character reference')
        names = [key for key, _ in attrs]
        require(len(names) == len(set(names)), 'Duplicate attribute')
        attributes = dict(attrs)
        for key, val in attrs:
            require(key in GLOBAL | SPECIFIC.get(tag, set()) | (SVG_ATTR if in_svg else set()), 'Unsupported attribute: ' + key)
            require(val is not None and len(val) <= 65536, 'Missing or oversized attribute value')
            require(not any(ord(c) < 32 and c not in '\t\r\n' for c in val), 'Control character in attribute')
            if key == 'tabindex': require(not in_svg and val == '0', 'Only HTML tabindex=0 is supported for static keyboard access')
            if key == 'data-archify-editorial': require(re.fullmatch(r'[a-z][a-z0-9-]{0,63}', val), 'Invalid static editorial type marker')
            if key == 'id':
                require(ID.fullmatch(val) and val not in self.ids, 'Invalid or duplicate document ID')
            if key in {'aria-labelledby', 'aria-describedby'}:
                for ref in val.split():
                    require(ID.fullmatch(ref), 'Invalid ID reference')
                    self.refs.append((ref, 'aria'))
            if key in {'href', 'xlink:href'}:
                require(val.startswith('#') and ID.fullmatch(val[1:]), 'Only fragment references are allowed')
                self.refs.append((val[1:], tag))
            if key == 'xmlns': require(val == ('http://www.w3.org/2000/svg' if in_svg else 'http://www.w3.org/1999/xhtml'), 'Unexpected XML namespace')
            if key == 'xmlns:xlink': require(val == 'http://www.w3.org/1999/xlink', 'Unexpected xlink namespace')
            if key == 'style': css_declarations(val, self.refs)
            if key in SVG_ATTR | {'stop-color','stop-opacity'} and key not in NUMERIC | {'viewbox','d','points','transform','dx','dy'}:
                if key in PROPS: css_declarations(key + ':' + val, self.refs)
                else: require(not re.search(r'url\s*\(|[\<>]', val, re.I), 'Unsupported SVG attribute syntax')
            if key in NUMERIC:
                result = numbers(val, key, key in POSITIVE, True)
                require(key in {'x','y','dx','dy'} or len(result) == 1, 'Scalar geometry value required: ' + key)
                if key in {'font-size','width','height','markerwidth','markerheight'}: require(all(n > 0 for n in result), 'Positive size required: ' + key)
            if key == 'offset':
                result = numbers(val, key, True, True)
                require(len(result) == 1 and result[0] <= (100 if val.endswith('%') else 1), 'Gradient offset out of range')
            if key == 'orient': require(val in {'auto','auto-start-reverse'} or re.fullmatch(NUMBER, val), 'Invalid marker orientation')
            if key in {'gradientunits','clippathunits'}: require(val in {'objectBoundingBox','userSpaceOnUse'}, 'Invalid coordinate units')
            if key == 'markerunits': require(val in {'strokeWidth','userSpaceOnUse'}, 'Invalid marker units')
            if key == 'spreadmethod': require(val in {'pad','reflect','repeat'}, 'Invalid gradient spread method')
            if key in {'points', 'viewbox'}:
                nums = numbers(val, key)
                if key == 'points': require(len(nums) >= 4 and len(nums) % 2 == 0, 'Invalid point list')
            if key in {'d', 'transform', 'gradienttransform'}:
                if key == 'd': require(re.fullmatch(r'[MmZzLlHhVvCcSsQqTtAa0-9eE+.,\s-]+', val), 'Unsupported path syntax')
                else: require(re.fullmatch(r'(?:\s*(?:matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*' + NUMBER + r'(?:[\s,]+' + NUMBER + r')*\s*\)\s*)+', val), 'Unsupported transform syntax')
                if key == 'd': path_data(val)
                else: transform_data(val)
        if tag == 'meta':
            if 'http-equiv' in attributes:
                require(self.delivered and raw == CSP_META and parent and not parent['children'] and not parent['text'].strip(), 'Source-supplied or misplaced CSP/http-equiv rejected')
                self.csp_count += 1
            elif 'charset' in attributes:
                require(set(attributes) == {'charset'} and attributes['charset'].lower() == 'utf-8', 'Only UTF-8 charset meta supported')
            else:
                require(set(attributes) == {'name','content'} and attributes['name'].lower() in {'viewport','description','author'}, 'Unsupported meta')
        if tag == 'style':
            require(attributes.get('type', 'text/css').lower() == 'text/css', 'Unsupported style type')
        if tag == 'svg':
            require('viewbox' in attributes, 'Primary SVG needs viewBox')
            box = numbers(attributes['viewbox'], 'viewBox')
            require(len(box) == 4 and box[2] > 0 and box[3] > 0, 'SVG viewBox must have four finite values and positive size')
        node = {'tag': tag, 'attrs': attributes, 'svg': in_svg, 'text': '', 'children': [], 'parent': parent}
        self.nodes.append(node)
        if 'id' in attributes: self.ids[attributes['id']] = node
        if parent: parent['children'].append(node)
        if tag == 'head':
            line, column = self.getpos()
            self.head_end = self.line_offsets[line-1] + column + len(raw)
        if not self_closing and not (tag in VOID and not in_svg): self.stack.append(node)

    def handle_endtag(self, tag):
        line, column = self.getpos()
        offset = self.line_offsets[line-1] + column
        raw = self.source[offset:self.source.find('>', offset)+1]
        require(re.fullmatch(r'</[A-Za-z][A-Za-z0-9:-]*\s*>', raw), 'Ambiguous end tag')
        require(self.stack and self.stack[-1]['tag'] == tag, 'Misnested or unexpected end tag: ' + tag)
        self.stack.pop()

    def handle_data(self, data):
        require('<' not in data, 'Unparsed markup rejected')
        if not self.stack:
            require(not data.strip(), 'Text outside document root')
            return
        parent = self.stack[-1]
        if data.strip() and parent['tag'] in {'html','head','table','thead','tbody','tfoot','tr','ul','ol','dl'}:
            raise Reject('Text in structural container would require HTML repair')
        parent['text'] += data

    def handle_entityref(self, name):
        require(name in {'amp','lt','gt','quot','apos','nbsp'}, 'Only basic HTML entities are supported')
        self.entity_ending('&' + name)
        self.handle_data({'amp':'&','lt':'‹','gt':'>','quot':'"','apos':"'",'nbsp':' ' }[name])

    def entity_ending(self, prefix):
        line, column = self.getpos()
        offset = self.line_offsets[line-1] + column
        require(self.source[offset:offset+len(prefix)+1] == prefix + ';', 'Entity semicolon required')

    def handle_charref(self, name):
        self.entity_ending('&#' + name)
        try: code = int(name[1:], 16) if name.lower().startswith('x') else int(name)
        except ValueError: raise Reject('Invalid numeric character reference')
        require(32 <= code <= 0x10ffff and not 0xd800 <= code <= 0xdfff and code != 127, 'Invalid/control character reference')
        self.handle_data('‹' if code == 60 else chr(code))

    def finish(self):
        require(not self.stack, 'Unclosed element')
        require(self.doctype, 'HTML doctype required')
        for tag in ('html','head','body','svg'):
            require(sum(n['tag'] == tag for n in self.nodes) == 1, 'Exactly one ' + tag + ' required')
        root = self.nodes[0]
        require([n['tag'] for n in root['children']] == ['head','body'], 'Explicit head then body required')
        require(self.csp_count == (1 if self.delivered else 0), 'Delivered CSP missing or duplicated')
        titles = [n for n in self.nodes if n['tag'] == 'title' and not n['svg']]
        require(len(titles) == 1 and meaningful(titles[0]['text']), 'Meaningful non-placeholder HTML title required')
        svg = next(n for n in self.nodes if n['tag'] == 'svg')
        for tag in ('title','desc'):
            items = [n for n in svg['children'] if n['tag'] == tag]
            require(len(items) == 1 and meaningful(items[0]['text'], 8 if tag == 'title' else 16), 'Primary SVG needs meaningful non-placeholder ' + tag)
        def ancestors(node):
            result = []
            while node:
                result.append(node); node = node['parent']
            return result
        visible = []
        for node in self.nodes:
            if node['text'].strip() and node['tag'] not in {'style'}:
                require(not PLACEHOLDER.search(node['text']), 'Unresolved placeholder text')
            if node['tag'] in {'text','tspan'} and meaningful(node['text'], 3):
                chain = ancestors(node)
                if not any(n['tag'] in {'defs','marker','clippath'} for n in chain) and not any(n['attrs'].get('fill','').lower() in {'none','transparent'} for n in chain):
                    visible.append(node)
            if node['tag'] == 'style': css_sheet(node['text'], self.refs)
        require(visible, 'At least one authored SVG text candidate outside definitions is required')
        for ref, kind in self.refs:
            require(ref in self.ids, 'Unresolved document reference: ' + ref)
            if kind != 'aria':
                require(self.ids[ref]['svg'], 'Resource fragment must resolve inside primary SVG')
            if kind == 'use':
                require(self.ids[ref]['svg'] and self.ids[ref]['tag'] in {'g','rect','circle','ellipse','line','polyline','polygon','path','text'}, 'use must reference a static SVG shape/group')
        # SVG use can clone an acyclic definition graph exponentially. A cycle
        # guard alone is insufficient. Keep referenced targets leaf-like (no
        # nested use anywhere in their subtree) and bound direct clone cost.
        subtree = {}
        for node in reversed(self.nodes):
            children = [subtree[id(child)] for child in node['children']]
            own_bytes = len(node['text'].encode('utf-8')) + len(node['tag']) + 16 + sum(len(k) + len(v.encode('utf-8')) + 4 for k, v in node['attrs'].items())
            subtree[id(node)] = (1 + sum(c[0] for c in children), own_bytes + sum(c[1] for c in children), node['tag'] == 'use' or any(c[2] for c in children))
        expanded_nodes, expanded_bytes, _ = subtree[id(root)]
        for node in self.nodes:
            if node['tag'] != 'use': continue
            for attr in ('href', 'xlink:href'):
                if attr not in node['attrs']: continue
                count, cost, nested_use = subtree[id(self.ids[node['attrs'][attr][1:]])]
                require(not nested_use, 'SVG use targets may not contain further use elements')
                expanded_nodes += count
                expanded_bytes += cost
                require(expanded_nodes <= 24000 and expanded_bytes <= 8 * MAX_BYTES, 'SVG use clone expansion exceeds static budget')
        # Disallow recursive href graphs, including gradient inheritance.

        visiting, done = set(), set()
        def visit(node):
            key = id(node)
            require(key not in visiting, 'Cyclic SVG use/reference graph')
            if key in done: return
            visiting.add(key)
            for child in node['children']: visit(child)
            for attr in ('href','xlink:href'):
                if attr in node['attrs']: visit(self.ids[node['attrs'][attr][1:]])
            visiting.remove(key); done.add(key)
        visit(root)
        return [
            {'name':'bounded_utf8_input','ok':True},
            {'name':'strict_static_html_svg_subset','ok':True},
            {'name':'offline_css_and_fragment_references','ok':True},
            {'name':'unique_resolving_ids','ok':True},
            {'name':'finite_geometry_bounds','ok':True},
            {'name':'bounded_svg_use_expansion','ok':True,'expandedNodeEstimate':expanded_nodes,'expandedByteEstimate':expanded_bytes},
            {'name':'authored_title_description_text_candidates','ok':True,'textCandidates':len(visible)},
            {'name':'restrictive_delivery_csp','ok':True,'status':'present' if self.delivered else 'inserted only during delivery'},
        ]

def validate(data, delivered=False):
    require(0 < len(data) <= MAX_BYTES, 'Input must be 1..1048576 bytes')
    try: source = data.decode('utf-8', errors='strict')
    except UnicodeDecodeError: raise Reject('Input must be valid UTF-8')
    require(not any((ord(c) < 32 and c not in '\t\r\n') or ord(c) == 127 for c in source), 'Control characters rejected')
    require(not re.search(r'<!\s*(?:ENTITY|\[CDATA)|<\?', source, re.I), 'XML entities/processing instructions rejected')
    parser = Editorial(source, delivered)
    parser.feed(source)
    require(not parser.rawdata, 'Incomplete markup/entity at end of input')
    parser.close()
    checks = parser.finish()
    return source, parser.head_end, checks

def parent_fd(filename):
    absolute = os.path.abspath(filename)
    require(os.path.basename(absolute) not in {'','.','..'}, 'Explicit file path required')
    fd = os.open(os.path.sep, os.O_RDONLY | os.O_DIRECTORY)
    try:
        for part in os.path.dirname(absolute).split(os.path.sep):
            if not part: continue
            nxt = os.open(part, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            os.close(fd); fd = nxt
        return fd, os.path.basename(absolute), absolute
    except BaseException:
        os.close(fd); raise

def read_snapshot(filename):
    directory, name, absolute = parent_fd(filename)
    fd = None
    try:
        fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory)
        before = os.fstat(fd)
        require(stat.S_ISREG(before.st_mode), 'Input must be a regular file, not a device/pipe')
        require(0 < before.st_size <= MAX_BYTES, 'Input must be 1..1048576 bytes')
        chunks, total = [], 0
        while total <= MAX_BYTES:
            chunk = os.read(fd, min(65536, MAX_BYTES + 1 - total))
            if not chunk: break
            chunks.append(chunk); total += len(chunk)
        after = os.fstat(fd)
        require((before.st_size,before.st_mtime_ns,before.st_ctime_ns) == (after.st_size,after.st_mtime_ns,after.st_ctime_ns), 'Source changed during snapshot read')
        data = b''.join(chunks)
        require(len(data) == before.st_size, 'Source snapshot size changed')
        return data, absolute
    finally:
        if fd is not None: os.close(fd)
        os.close(directory)

def publish(filename, data):
    require(filename.lower().endswith('.html'), 'Output must be an explicit NEW .html path')
    directory, name, absolute = parent_fd(filename)
    scratch, fd = None, None
    try:
        try: os.stat(name, dir_fd=directory, follow_symlinks=False)
        except FileNotFoundError: pass
        else: raise Reject('Output already exists; overwrites, symlinks and aliases are refused')
        scratch = '.archify-editorial-' + secrets.token_hex(16) + '.tmp'
        fd = os.open(scratch, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=directory)
        view = memoryview(data)
        while view:
            written = os.write(fd, view)
            require(written > 0, 'Unable to write complete artifact')
            view = view[written:]
        os.fsync(fd)
        os.close(fd); fd = None
        # Same-directory hard link publishes complete bytes and fails if another
        # writer wins the name. Unlike rename(), this never replaces a target.
        os.link(scratch, name, src_dir_fd=directory, dst_dir_fd=directory, follow_symlinks=False)
        return absolute
    finally:
        if fd is not None: os.close(fd)
        if scratch is not None:
            try: os.unlink(scratch, dir_fd=directory)
            except FileNotFoundError: pass
        os.close(directory)

def identity(data, filename):
    return {'path': filename, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes':len(data)}

def main(argv):
    if len(argv) == 2 and argv[1] == '--json':
        argv = ['check', argv[0]]
    receipt = {'schemaVersion':1, 'ok':False, 'evidenceKind':'static-editorial-check', 'browserReview':'untested', 'visualReview':'untested', 'limitations':LIMITS}
    try:
        require(len(argv) in {2,3} and argv[0] in {'check','deliver'} and len(argv) == (2 if argv[0] == 'check' else 3), 'Usage: check input.html | deliver input.html NEW-output.html')
        action, filename = argv[:2]
        receipt['command'] = 'editorial ' + action
        data, absolute = read_snapshot(filename)
        receipt['input'] = identity(data, absolute)
        source, offset, checks = validate(data, delivered=(CSP_META.encode('utf-8') in data) if action == 'check' else False)
        receipt['checks'] = checks
        receipt['managedCsp'] = any(c['name'] == 'restrictive_delivery_csp' and c.get('status') == 'present' for c in checks)
        if action == 'deliver':
            output = argv[2]
            require(os.path.abspath(output) != absolute, 'Output must not alias input')
            artifact = (source[:offset] + CSP_META + source[offset:]).encode('utf-8')
            _, _, delivered_checks = validate(artifact, delivered=True)
            receipt['checks'] = delivered_checks
            receipt['managedCsp'] = True
            receipt['artifact'] = identity(artifact, os.path.abspath(output))
            publish(output, artifact)
        receipt['ok'] = True
    except (Reject, OSError, ValueError, RecursionError) as error:
        receipt['error'] = str(error)[:1000]
        receipt.setdefault('checks', []).append({'name':'editorial_acceptance','ok':False,'details':receipt['error']})
    print(json.dumps(receipt, ensure_ascii=True, indent=2))
    return 0 if receipt['ok'] else 1

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
