// Original analytic field rendered and distorted by a real WebGL2 fragment shader.
export function createWarp(canvas) {
  const gl = canvas.getContext('webgl2', {alpha: false, antialias: false, preserveDrawingBuffer: true});
  if (!gl) throw new Error('WebGL2 unavailable');
  let program, buffer, vao;
  const shaders = [];
  function destroy() {
    if (buffer) gl.deleteBuffer(buffer);
    if (vao) gl.deleteVertexArray(vao);
    if (program) gl.deleteProgram(program);
    for (const shader of shaders.splice(0)) gl.deleteShader(shader);
    program = buffer = vao = null;
  }
  function compile(type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Shader allocation failed');
    shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed');
    return shader;
  }
  try {
    const vertex = compile(gl.VERTEX_SHADER, `#version 300 es
      in vec2 position; out vec2 uv;
      void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`);
    const fragment = compile(gl.FRAGMENT_SHADER, `#version 300 es
      precision highp float;
      in vec2 uv; out vec4 color;
      uniform float time; uniform vec2 pointer; uniform float aspect;
      void main(){
        vec2 delta=uv-pointer;
        float distance=length(delta*vec2(aspect,1.));
        vec2 bend=vec2(sin(uv.y*15.+time*1.8),cos(uv.x*13.-time*1.3))*.026*sin(time*.8);
        bend+=delta*exp(-distance*7.)*sin(time*3.-distance*24.)*.15;
        vec2 p=uv+bend;
        float stripe=.5+.5*sin((p.x+p.y*.22)*45.);
        vec3 base=mix(vec3(.08,.18,.29),vec3(.20,.68,.65),smoothstep(.28,.72,stripe));
        float sun=1.-smoothstep(.13,.145,length((p-vec2(.72,.66))*vec2(aspect,1.)));
        base=mix(base,vec3(1.,.73,.43),sun);
        float ridge=smoothstep(.29,.30,p.y+.055*sin(p.x*17.));
        base=mix(vec3(.06,.12,.22),base,ridge);
        color=vec4(base,1.);
      }`);
    program = gl.createProgram(); if (!program) throw new Error('Program allocation failed');
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program link failed');
    vao = gl.createVertexArray(); buffer = gl.createBuffer();
    if (!vao || !buffer) throw new Error('Geometry allocation failed');
    gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const timeUniform=gl.getUniformLocation(program,'time'), pointerUniform=gl.getUniformLocation(program,'pointer'), aspectUniform=gl.getUniformLocation(program,'aspect');
    return {backend: 'webgl2', destroy, getEntityCount: () => 1,
      render({width,height,pixelWidth,pixelHeight,time,pointer}) {
        if (gl.isContextLost()) throw new Error('WebGL context lost');
        gl.viewport(0,0,pixelWidth,pixelHeight); gl.useProgram(program); gl.bindVertexArray(vao);
        gl.uniform1f(timeUniform,time); gl.uniform2f(pointerUniform,pointer ? pointer.x/width : .5,pointer ? 1-pointer.y/height : .5);
        gl.uniform1f(aspectUniform,width/height); gl.drawArrays(gl.TRIANGLES,0,3);
      }};
  } catch (error) { destroy(); throw error; }
}
