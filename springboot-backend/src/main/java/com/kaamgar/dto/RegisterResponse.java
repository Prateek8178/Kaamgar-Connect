package com.kaamgar.dto;

public class RegisterResponse {
    private String pendingUserId;
    private String email;

    public RegisterResponse() {}
    public RegisterResponse(String pendingUserId, String email) {
        this.pendingUserId = pendingUserId;
        this.email = email;
    }
    public String getPendingUserId()          { return pendingUserId; }
    public void   setPendingUserId(String u)  { this.pendingUserId = u; }
    public String getEmail()                  { return email; }
    public void   setEmail(String e)          { this.email = e; }
}
