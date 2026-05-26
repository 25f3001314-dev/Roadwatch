package com.roadwatch.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BoundingBoxDto {
    @JsonProperty("xMin")
    private double xMin;
    @JsonProperty("yMin")
    private double yMin;
    @JsonProperty("xMax")
    private double xMax;
    @JsonProperty("yMax")
    private double yMax;

    public double getxMin() { return xMin; }
    public void setxMin(double xMin) { this.xMin = xMin; }
    public double getyMin() { return yMin; }
    public void setyMin(double yMin) { this.yMin = yMin; }
    public double getxMax() { return xMax; }
    public void setxMax(double xMax) { this.xMax = xMax; }
    public double getyMax() { return yMax; }
    public void setyMax(double yMax) { this.yMax = yMax; }
}
