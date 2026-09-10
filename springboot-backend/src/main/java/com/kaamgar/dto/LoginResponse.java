package com.kaamgar.dto;

public class LoginResponse {
    private String  token;
    private UserDto user;

    public LoginResponse() {}
    public LoginResponse(String token, UserDto user) { this.token = token; this.user = user; }
    public String  getToken()          { return token; }
    public void    setToken(String t)  { this.token = t; }
    public UserDto getUser()           { return user; }
    public void    setUser(UserDto u)  { this.user = u; }
}
