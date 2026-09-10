// Prime adaptation: detector-only entry; no installer/context/hooks/live dispatch.
use impeccable_detect::HtmlEngine;
use impeccable_detect::profiler::DetectorProfile;
use std::rc::Rc;
use serde_json::json;
fn main() {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.len()!=2 || args[0]!="source" { eprintln!("expected source and one target"); std::process::exit(1); }
    let profile=Rc::new(DetectorProfile::new());
    let options=impeccable_detect::ScanOptions { profile:Some(profile.clone()), ..Default::default() };
    let mut warnings=Vec::new();
    let findings=if args[1].to_ascii_lowercase().ends_with(".html") || args[1].to_ascii_lowercase().ends_with(".htm") {
        impeccable_html::StaticHtmlEngine::default().detect_html(&args[1], &options, &mut warnings)
    } else {
        std::fs::read_to_string(&args[1]).map_err(|e|impeccable_detect::engines::EngineError::new(e.to_string())).map(|text|
            impeccable_detect::detect_text::detect_text(&text,&args[1],&impeccable_detect::detect_text::TextOptions {profile:Some(&profile),..Default::default()}))
    };
    match findings {
        Ok(findings)=>println!("{}",json!({"findings":findings,"profile":*profile.events.borrow(),"warnings":String::from_utf8_lossy(&warnings)})),
        Err(e)=>{println!("{}",json!({"error":e.message}));std::process::exit(1);}
    }
}
