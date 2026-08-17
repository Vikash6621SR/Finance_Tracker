package com.example.financetracker.repository;

import com.example.financetracker.entity.AppSettings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppSettingsRepository
        extends JpaRepository<AppSettings, Long> {

}