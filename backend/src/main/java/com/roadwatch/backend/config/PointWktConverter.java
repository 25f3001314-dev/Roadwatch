package com.roadwatch.backend.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.locationtech.jts.io.WKTWriter;

@Converter
public class PointWktConverter implements AttributeConverter<Point, String> {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    private static final WKTReader WKT_READER = new WKTReader(GEOMETRY_FACTORY);
    private static final WKTWriter WKT_WRITER = new WKTWriter();

    @Override
    public String convertToDatabaseColumn(Point attribute) {
        if (attribute == null) {
            return null;
        }
        return WKT_WRITER.write(attribute);
    }

    @Override
    public Point convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            return (Point) WKT_READER.read(dbData.trim());
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid WKT for Point: " + dbData, e);
        }
    }
}
