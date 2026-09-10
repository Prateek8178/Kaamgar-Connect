package com.kaamgar.dto;

public class RegisterRequest {
    private String username, email, password, role;

    public RegisterRequest() {}
    public String getUsername()           { return username; }
    public void   setUsername(String u)   { this.username = u; }
    public String getEmail()              { return email; }
    public void   setEmail(String e)      { this.email = e; }
    public String getPassword()           { return password; }
    public void   setPassword(String p)   { this.password = p; }
    public String getRole()               { return role; }
    public void   setRole(String r)       { this.role = r; }
}
