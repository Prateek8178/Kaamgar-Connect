package com.kaamgar.dto;

public class ResetPasswordRequest {
    private String userId;
    private String otp;
    private String newPassword;

    public ResetPasswordRequest() {}
    public String getUserId()             { return userId; }
    public void   setUserId(String u)     { this.userId = u; }
    public String getOtp()                { return otp; }
    public void   setOtp(String o)        { this.otp = o; }
    public String getNewPassword()        { return newPassword; }
    public void   setNewPassword(String p){ this.newPassword = p; }
}
