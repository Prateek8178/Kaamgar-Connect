package com.kaamgar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String  password       = "";
    private String  firstName      = "";
    private String  lastName       = "";
    private String  role           = "worker";
    private String  phone          = "";
    private String  otp            = "";
    private boolean otpVerified    = false;
    private Instant otpCreatedAt;
    private String  language       = "en";
    private String  profilePhoto   = "";
    private String  city           = "";
    private String  bio            = "";
    private Double  latitude;
    private Double  longitude;
    private boolean isActive       = false;

    @CreatedDate  private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;

    public User() {}

    public String  getId()                     { return id; }
    public void    setId(String id)            { this.id = id; }
    public String  getUsername()               { return username; }
    public void    setUsername(String u)       { this.username = u; }
    public String  getEmail()                  { return email; }
    public void    setEmail(String e)          { this.email = e; }
    public String  getPassword()               { return password; }
    public void    setPassword(String p)       { this.password = p; }
    public String  getFirstName()              { return firstName; }
    public void    setFirstName(String f)      { this.firstName = f; }
    public String  getLastName()               { return lastName; }
    public void    setLastName(String l)       { this.lastName = l; }
    public String  getRole()                   { return role; }
    public void    setRole(String r)           { this.role = r; }
    public String  getPhone()                  { return phone; }
    public void    setPhone(String p)          { this.phone = p; }
    public String  getOtp()                    { return otp; }
    public void    setOtp(String o)            { this.otp = o; }
    public boolean isOtpVerified()             { return otpVerified; }
    public void    setOtpVerified(boolean v)   { this.otpVerified = v; }
    public Instant getOtpCreatedAt()           { return otpCreatedAt; }
    public void    setOtpCreatedAt(Instant t)  { this.otpCreatedAt = t; }
    public String  getLanguage()               { return language; }
    public void    setLanguage(String l)       { this.language = l; }
    public String  getProfilePhoto()           { return profilePhoto; }
    public void    setProfilePhoto(String p)   { this.profilePhoto = p; }
    public String  getCity()                   { return city; }
    public void    setCity(String c)           { this.city = c; }
    public String  getBio()                    { return bio; }
    public void    setBio(String b)            { this.bio = b; }
    public Double  getLatitude()               { return latitude; }
    public void    setLatitude(Double l)       { this.latitude = l; }
    public Double  getLongitude()              { return longitude; }
    public void    setLongitude(Double l)      { this.longitude = l; }
    public boolean isActive()                  { return isActive; }
    public void    setActive(boolean a)        { this.isActive = a; }
    public Instant getCreatedAt()              { return createdAt; }
    public void    setCreatedAt(Instant c)     { this.createdAt = c; }
    public Instant getUpdatedAt()              { return updatedAt; }
    public void    setUpdatedAt(Instant u)     { this.updatedAt = u; }

    public String getFullName() {
        String full = ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
        return full.isEmpty() ? username : full;
    }
}
