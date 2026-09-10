package com.kaamgar.dto;

public class VerifyOtpRequest {
    private String userId, otp;
    public VerifyOtpRequest() {}
    public String getUserId()           { return userId; }
    public void   setUserId(String u)   { this.userId = u; }
    public String getOtp()              { return otp; }
    public void   setOtp(String o)      { this.otp = o; }
}
