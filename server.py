#!/usr/bin/env python3
"""
Simple HTTP server for MusicFlow development
Serves the application locally for testing and development
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
PORT = 8000
HOST = "localhost"

class MusicFlowHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with CORS headers for local development"""
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Start the MusicFlow development server"""
    
    # Change to the script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check if index.html exists
    if not Path("index.html").exists():
        print("❌ Error: index.html not found in current directory")
        print(f"Current directory: {os.getcwd()}")
        sys.exit(1)
    
    # Create server
    with socketserver.TCPServer((HOST, PORT), MusicFlowHandler) as httpd:
        print("🎵 MusicFlow Development Server")
        print("=" * 40)
        print(f"📍 Serving at: http://{HOST}:{PORT}")
        print(f"📁 Directory: {os.getcwd()}")
        print("=" * 40)
        print("🚀 Starting server...")
        
        # Open browser automatically
        try:
            webbrowser.open(f"http://{HOST}:{PORT}")
            print("🌐 Browser opened automatically")
        except Exception as e:
            print(f"⚠️  Could not open browser automatically: {e}")
            print(f"   Please open http://{HOST}:{PORT} manually")
        
        print("\n📋 Available files:")
        for file in sorted(Path(".").glob("*.html")):
            print(f"   • {file.name}")
        
        print("\n🎛️  Controls:")
        print("   • Ctrl+C to stop the server")
        print("   • Refresh browser to see changes")
        
        print("\n" + "=" * 40)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped by user")
            print("👋 Thanks for using MusicFlow!")

if __name__ == "__main__":
    main()
