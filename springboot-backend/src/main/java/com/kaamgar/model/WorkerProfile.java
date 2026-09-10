package com.kaamgar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "workerprofiles")
public class WorkerProfile {

    @Id private String id;
    private String  userId;
    private List<String> skills        = List.of("other");
    private String  extraSkills        = "";
    private int     experienceYears    = 0;
    private double  dailyRate          = 0;
    private boolean availability       = true;
    private double  rating             = 0;
    private int     totalJobs          = 0;
    private String  address            = "";
    private Double  latitude;
    private Double  longitude;
    private int     workingRadiusKm    = 10;
    private String  resume             = "";
    private boolean aadharVerified     = false;
    private String  portfolioUrl       = "";
    private String  languages          = "Hindi, English";

    @CreatedDate  private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;

    public WorkerProfile() {}

    public String  getId()                          { return id; }
    public void    setId(String id)                 { this.id = id; }
    public String  getUserId()                      { return userId; }
    public void    setUserId(String u)              { this.userId = u; }
    public List<String> getSkills()                 { return skills; }
    public void    setSkills(List<String> s)        { this.skills = s; }
    public String  getExtraSkills()                 { return extraSkills; }
    public void    setExtraSkills(String e)         { this.extraSkills = e; }
    public int     getExperienceYears()             { return experienceYears; }
    public void    setExperienceYears(int e)        { this.experienceYears = e; }
    public double  getDailyRate()                   { return dailyRate; }
    public void    setDailyRate(double d)           { this.dailyRate = d; }
    public boolean isAvailability()                 { return availability; }
    public void    setAvailability(boolean a)       { this.availability = a; }
    public double  getRating()                      { return rating; }
    public void    setRating(double r)              { this.rating = r; }
    public int     getTotalJobs()                   { return totalJobs; }
    public void    setTotalJobs(int t)              { this.totalJobs = t; }
    public String  getAddress()                     { return address; }
    public void    setAddress(String a)             { this.address = a; }
    public Double  getLatitude()                    { return latitude; }
    public void    setLatitude(Double l)            { this.latitude = l; }
    public Double  getLongitude()                   { return longitude; }
    public void    setLongitude(Double l)           { this.longitude = l; }
    public int     getWorkingRadiusKm()             { return workingRadiusKm; }
    public void    setWorkingRadiusKm(int w)        { this.workingRadiusKm = w; }
    public String  getResume()                      { return resume; }
    public void    setResume(String r)              { this.resume = r; }
    public boolean isAadharVerified()               { return aadharVerified; }
    public void    setAadharVerified(boolean a)     { this.aadharVerified = a; }
    public String  getPortfolioUrl()                { return portfolioUrl; }
    public void    setPortfolioUrl(String p)        { this.portfolioUrl = p; }
    public String  getLanguages()                   { return languages; }
    public void    setLanguages(String l)           { this.languages = l; }
    public Instant getCreatedAt()                   { return createdAt; }
    public void    setCreatedAt(Instant c)          { this.createdAt = c; }
    public Instant getUpdatedAt()                   { return updatedAt; }
    public void    setUpdatedAt(Instant u)          { this.updatedAt = u; }
}
