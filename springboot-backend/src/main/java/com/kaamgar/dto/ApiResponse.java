package com.kaamgar.dto;

public class ApiResponse<T> {
    private boolean success;
    private String  message;
    private T       data;

    public ApiResponse() {}
    public ApiResponse(boolean success, String message, T data) {
        this.success = success; this.message = message; this.data = data;
    }

    public static <T> ApiResponse<T> ok(String msg, T data)  { return new ApiResponse<>(true, msg, data); }
    public static <T> ApiResponse<T> fail(String msg)        { return new ApiResponse<>(false, msg, null); }

    public boolean isSuccess()          { return success; }
    public void    setSuccess(boolean s){ this.success = s; }
    public String  getMessage()         { return message; }
    public void    setMessage(String m) { this.message = m; }
    public T       getData()            { return data; }
    public void    setData(T d)         { this.data = d; }
}
