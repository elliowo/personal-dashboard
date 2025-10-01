use sysinfo::{System, Disks};
use axum::{
    response::Html,
    routing::get,
    Router,
};
use std::fs;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    let serve_dir = ServeDir::new("templates");

    let app = Router::new()
        .route("/", get(root))
        .fallback_service(serve_dir);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    println!("Dashboard running on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> Html<String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let system_name     = System::name().unwrap_or_else(|| "Unknown".to_string());
    let kernel_version  = System::kernel_version()
        .unwrap_or_else(|| "Unknown".to_string());
    let host_name       = System::host_name()
        .unwrap_or_else(|| "Unknown".to_string());

    // Get disk information
    let disks = Disks::new_with_refreshed_list();
    let mut disk_info = String::new();
    
    for disk in &disks {
        let total_space = disk.total_space() as f64;
        let available_space = disk.available_space() as f64;
        let used_space = total_space - available_space;

        if total_space > 0.0 {
            let formatted_total = format_bytes(total_space);
            let formatted_used = format_bytes(used_space);
            let percentage = (used_space / total_space) * 100.0;
            
            // Create progress bar HTML
            let bar_width = percentage.min(100.0) as u32;
            let bar_color = if percentage > 80.0 {
                "#e67e80" // red
            } else if percentage > 60.0 {
                "#f2873a" // orange
            } else {
                "#98971a" // everforest green
            };
            
            disk_info.push_str(&format!(
                "<div class=\"info-item\">
                    <div class=\"info-title\">{} ({})</div>
                    <div class=\"info-value\">{}/{} ({:.1}%)</div>
                    <div style=\"margin-top: 8px;\">
                        <div style=\"width: 100%; background-color: #e0e0e0; border-radius: 4px; height: 10px;\">
                            <div style=\"width: {}%; background-color: {}; height: 100%; border-radius: 4px;\"></div>
                        </div>
                    </div>
                </div>",
                disk.name().to_string_lossy(),
                disk.mount_point().to_string_lossy(),
                formatted_used,
                formatted_total,
                percentage,
                bar_width,
                bar_color
            ));
        }
    }

    let memory_usage = format_usage(sys.used_memory() as f64, sys.total_memory() as f64);
    let swap_usage   = format_usage(sys.used_swap() as f64, sys.total_swap() as f64);

    let html_template =
        fs::read_to_string("templates/index.html")
            .unwrap_or_else(|_| "<h1>Error loading template</h1>".to_string());

    let html_content = html_template
        .replace("{{system_name}}", &system_name)
        .replace("{{kernel_version}}", &kernel_version)
        .replace("{{host_name}}", &host_name)
        .replace("{{cpu_count}}", &sys.cpus().len().to_string())
        .replace("{{memory_usage}}", &memory_usage)
        .replace("{{swap_usage}}", &swap_usage)
        .replace("{{disk_info}}", &disk_info);
    
    Html(html_content)
}

fn format_bytes(bytes: f64) -> String {
    // convert *bytes* → MB or GB (rounded to two decimals)
    if bytes >= 1024.0 * 1024.0 * 1024.0 {
        format!("{:.2} GB", bytes / (1024.0 * 1024.0 * 1024.0))
    } else if bytes >= 1024.0 * 1024.0 {
        format!("{:.2} MB", bytes / (1024.0 * 1024.0))
    } else {
        format!("{:.2} KB", bytes / 1024.0)
    }
}

fn format_usage(used: f64, total: f64) -> String {
    if total > 0.0 {
        let used_formatted = format_bytes(used);
        let total_formatted = format_bytes(total);
        format!("{} / {}", used_formatted, total_formatted)
    } else {
        "0.00 B / 0.00 B".to_string()
    }
}
