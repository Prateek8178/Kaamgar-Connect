package com.kaamgar.dto;

public class ResendOtpRequest {
    private String userId;
    public ResendOtpRequest() {}
    public String getUserId()         { return userId; }
    public void   setUserId(String u) { this.userId = u; }
}
