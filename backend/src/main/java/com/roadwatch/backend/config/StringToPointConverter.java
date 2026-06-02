package com.roadwatch.backend.config;

import org.locationtech.jts.geom.Point;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToPointConverter implements Converter<String, Point> {
    @Override
    public Point convert(String source) {
        if (source == null || source.trim().isEmpty()) {
            return null;
        }
        try {
            return (Point) new WKTReader().read(source);
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid WKT format for Point", e);
        }
    }
}
