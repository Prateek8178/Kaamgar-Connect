package com.kaamgar.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "applications")
public class Application {

    @Id private String id;
    private String jobId;
    private String workerId;
    private String status       = "pending";
    private String coverNote    = "";
    private String resume       = "";
    private double proposedRate = 0;

    @CreatedDate  private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;

    public Application() {}

    public String  getId()                      { return id; }
    public void    setId(String id)             { this.id = id; }
    public String  getJobId()                   { return jobId; }
    public void    setJobId(String j)           { this.jobId = j; }
    public String  getWorkerId()                { return workerId; }
    public void    setWorkerId(String w)        { this.workerId = w; }
    public String  getStatus()                  { return status; }
    public void    setStatus(String s)          { this.status = s; }
    public String  getCoverNote()               { return coverNote; }
    public void    setCoverNote(String c)       { this.coverNote = c; }
    public String  getResume()                  { return resume; }
    public void    setResume(String r)          { this.resume = r; }
    public double  getProposedRate()            { return proposedRate; }
    public void    setProposedRate(double p)    { this.proposedRate = p; }
    public Instant getCreatedAt()               { return createdAt; }
    public void    setCreatedAt(Instant c)      { this.createdAt = c; }
    public Instant getUpdatedAt()               { return updatedAt; }
    public void    setUpdatedAt(Instant u)      { this.updatedAt = u; }
}
