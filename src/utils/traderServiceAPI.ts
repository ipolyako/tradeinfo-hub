import { ToastProps } from "@/types/toast";

interface UserProfile {
  id: string;
  username: string | null;
  trader_service_name: string | null;
  trader_secret: string | null;
  server_URL: string | null;
}

export class TraderServiceAPI {
  private userProfile: UserProfile | null;
  private setResults: (results: string) => void;
  private toast: (props: ToastProps) => void;

  constructor(
    userProfile: UserProfile | null,
    setResults: (results: string) => void,
    toast: (props: ToastProps) => void
  ) {
    this.userProfile = userProfile;
    this.setResults = setResults;
    this.toast = toast;
  }

  async callAPI(endpoint: string, method: 'GET' | 'POST' = 'GET') {
    if (!this.userProfile?.trader_service_name || !this.userProfile?.trader_secret) {
      this.setResults(`${this.getResults()}\nError: Missing trader service credentials`);
      this.toast({
        title: "API Error",
        description: "Missing trader service credentials",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      // Parse and use server_URL correctly from user profile if available, otherwise fallback to default URL
      let baseUrl = "https://auth.decoglobal.us:8443";  // Default URL
      
      if (this.userProfile.server_URL) {
        // Ensure we don't double-add the protocol
        const serverUrl = this.userProfile.server_URL;
        if (serverUrl.startsWith("http://") || serverUrl.startsWith("https://")) {
          // If URL already has protocol, use it directly but ensure it has the port
          const urlObj = new URL(serverUrl);
          if (!urlObj.port) {
            urlObj.port = "8443";
          }
          baseUrl = urlObj.toString().replace(/\/$/, ""); // Remove trailing slash if present
        } else {
          // Otherwise add the protocol and port
          baseUrl = `https://${serverUrl}:8443`;
        }
      }
      
      const path = `/services/${this.userProfile.trader_service_name}/${endpoint}`;
      const url = `${baseUrl}${path}`;
      
      // Log request details for debugging
      console.log(`Making API ${method} call to: ${url}`);
      console.log(`Request path: ${path}`);
      
      // Make the API request
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${this.userProfile.trader_secret}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Parse and return the actual API response
      try {
        const data = await response.json();
        console.log('API Response:', data);
        return data;
      } catch (e) {
        // If we can't parse JSON, return a text response
        const text = await response.text();
        console.log('API Response (text):', text);
        return text;
      }
    } catch (error: any) {
      console.error('API call error:', error);
      this.setResults(`${this.getResults()}\nAPI Error: ${error.message}`);
      this.toast({
        title: "API Error",
        description: error.message || "Failed to call trader service",
        variant: "destructive",
      });
      return null;
    }
  }

  // Helper method to get current results
  private getResults(): string {
    // This is a workaround since we can't directly access the previous value
    // in the setResults function parameter
    return "";
  }
}
