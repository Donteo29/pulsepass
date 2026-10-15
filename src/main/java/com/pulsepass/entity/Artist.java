package com.pulsepass.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String stageName;

    @Column(nullable = false, length = 80)
    private String country;

    @Column(nullable = false, length = 80)
    private String genre;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToMany(mappedBy = "artists")
    private Set<Event> events = new HashSet<>();

    protected Artist() {
    }

    public Artist(String stageName, String country, String genre, Boolean active) {
        this.stageName = stageName;
        this.country = country;
        this.genre = genre;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getStageName() {
        return stageName;
    }

    public String getCountry() {
        return country;
    }

    public String getGenre() {
        return genre;
    }

    public Boolean getActive() {
        return active;
    }

    public Set<Event> getEvents() {
        return events;
    }
}
