package com.kaamgar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "jobs")
public class Job {

    @Id private String id;
    private String  employerId;
    private String  title;
    private String  titleHi        = "";
    private String  category;
    private String  jobType        = "full_time";
    private String  experienceReq  = "fresher";
    private String  skillsRequired = "";
    private String  description;
    private String  descriptionHi  = "";
    private String  location;
    private Double  latitude;
    private Double  longitude;
    private double  salaryMin      = 0;
    private double  salaryMax      = 0;
    private int     openings       = 1;
    private boolean isActive       = true;
    private boolean isFeatured     = false;
    private int     views          = 0;
    private Instant deadline;

    @CreatedDate  private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;

    public Job() {}

    public String  getId()                        { return id; }
    public void    setId(String id)               { this.id = id; }
    public String  getEmployerId()                { return employerId; }
    public void    setEmployerId(String e)        { this.employerId = e; }
    public String  getTitle()                     { return title; }
    public void    setTitle(String t)             { this.title = t; }
    public String  getTitleHi()                   { return titleHi; }
    public void    setTitleHi(String t)           { this.titleHi = t; }
    public String  getCategory()                  { return category; }
    public void    setCategory(String c)          { this.category = c; }
    public String  getJobType()                   { return jobType; }
    public void    setJobType(String j)           { this.jobType = j; }
    public String  getExperienceReq()             { return experienceReq; }
    public void    setExperienceReq(String e)     { this.experienceReq = e; }
    public String  getSkillsRequired()            { return skillsRequired; }
    public void    setSkillsRequired(String s)    { this.skillsRequired = s; }
    public String  getDescription()               { return description; }
    public void    setDescription(String d)       { this.description = d; }
    public String  getDescriptionHi()             { return descriptionHi; }
    public void    setDescriptionHi(String d)     { this.descriptionHi = d; }
    public String  getLocation()                  { return location; }
    public void    setLocation(String l)          { this.location = l; }
    public Double  getLatitude()                  { return latitude; }
    public void    setLatitude(Double l)          { this.latitude = l; }
    public Double  getLongitude()                 { return longitude; }
    public void    setLongitude(Double l)         { this.longitude = l; }
    public double  getSalaryMin()                 { return salaryMin; }
    public void    setSalaryMin(double s)         { this.salaryMin = s; }
    public double  getSalaryMax()                 { return salaryMax; }
    public void    setSalaryMax(double s)         { this.salaryMax = s; }
    public int     getOpenings()                  { return openings; }
    public void    setOpenings(int o)             { this.openings = o; }
    public boolean isActive()                     { return isActive; }
    public void    setActive(boolean a)           { this.isActive = a; }
    public boolean isFeatured()                   { return isFeatured; }
    public void    setFeatured(boolean f)         { this.isFeatured = f; }
    public int     getViews()                     { return views; }
    public void    setViews(int v)                { this.views = v; }
    public Instant getDeadline()                  { return deadline; }
    public void    setDeadline(Instant d)         { this.deadline = d; }
    public Instant getCreatedAt()                 { return createdAt; }
    public void    setCreatedAt(Instant c)        { this.createdAt = c; }
    public Instant getUpdatedAt()                 { return updatedAt; }
    public void    setUpdatedAt(Instant u)        { this.updatedAt = u; }
}
