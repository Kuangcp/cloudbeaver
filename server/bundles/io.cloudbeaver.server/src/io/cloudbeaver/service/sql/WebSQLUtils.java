/*
 * DBeaver - Universal Database Manager
 * Copyright (C) 2010-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.cloudbeaver.service.sql;

import io.cloudbeaver.model.session.WebSession;
import io.cloudbeaver.server.CBConstants;
import org.jkiss.code.NotNull;
import org.jkiss.dbeaver.Log;
import org.jkiss.dbeaver.model.data.*;
import org.jkiss.dbeaver.model.exec.DBCException;
import org.jkiss.dbeaver.model.gis.DBGeometry;
import org.jkiss.dbeaver.model.gis.GisConstants;
import org.jkiss.dbeaver.model.gis.GisTransformUtils;
import org.jkiss.dbeaver.model.struct.DBSAttributeBase;
import org.jkiss.dbeaver.model.struct.DBSTypedObject;
import org.jkiss.dbeaver.utils.ContentUtils;
import org.jkiss.dbeaver.utils.GeneralUtils;
import org.jkiss.utils.CommonUtils;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Web SQL utils.
 */
public class WebSQLUtils {

    private static final Log log = Log.getLog(WebSQLUtils.class);

    public static final int BINARY_PREVIEW_LENGTH = 255;

    public static Object makeWebCellValue(WebSession session, DBSTypedObject type, Object cellValue, WebDataFormat dataFormat) throws DBCException {
        if (cellValue instanceof Date) {
            return CBConstants.ISO_DATE_FORMAT.format(cellValue);
        }
        if (cellValue instanceof DBDValue) {
            DBDValue dbValue = (DBDValue) cellValue;
            if (dbValue.isNull()) {
                return null;
            }
            else if (dbValue instanceof DBDDocument) {
                return serializeDocumentValue(session, (DBDDocument) dbValue);
            } else if (dbValue instanceof DBDComplexValue) {
                return serializeComplexValue(session, (DBDComplexValue)dbValue, dataFormat);
            } else if (dbValue instanceof DBGeometry) {
                return serializeGeometryValue((DBGeometry)dbValue);
            } else if (dbValue instanceof DBDContent) {
                return serializeContentValue(session, (DBDContent)dbValue);
            }
        }
        return cellValue;
    }

    private static Object serializeComplexValue(WebSession session, DBDComplexValue value, WebDataFormat dataFormat) throws DBCException {
        if (value instanceof DBDCollection) {
            DBDCollection collection = (DBDCollection) value;
            int size = collection.getItemCount();
            Object[] items = new Object[size];
            for (int i = 0; i < size; i++) {
                items[i] = makeWebCellValue(session, collection.getComponentType(), collection.getItem(i), dataFormat);
            }

            Map<String, Object> map = createMapOfType("collection");
            map.put("value", items);
            return map;
        } else if (value instanceof DBDComposite) {
            DBDComposite composite = (DBDComposite)value;
            Map<String, Object> struct = new LinkedHashMap<>();
            for (DBSAttributeBase attr : composite.getAttributes()) {
                struct.put(attr.getName(), makeWebCellValue(session, attr, composite.getAttributeValue(attr), dataFormat));
            }

            Map<String, Object> map = createMapOfType("map");
            map.put("value", struct);
            return map;
        }
        return value.toString();
    }

    @NotNull
    private static Map<String, Object> createMapOfType(String type) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("$type", type);
        return map;
    }

    private static Map<String, Object> serializeDocumentValue(WebSession session, DBDDocument document) throws DBCException {
        String documentData;
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.serializeDocument(session.getProgressMonitor(), baos, StandardCharsets.UTF_8);
            documentData = new String(baos.toByteArray(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new DBCException("Error serializing document", e);
        }

        Map<String, Object> map = createMapOfType("document");
        map.put("id", CommonUtils.toString(document.getDocumentId()));
        map.put("contentType", document.getDocumentContentType());
        map.put("properties", Collections.emptyMap());
        map.put("data", documentData);
        return map;
    }

    private static Object serializeContentValue(WebSession session, DBDContent value) throws DBCException {

        Map<String, Object> map = createMapOfType("content");
        if (ContentUtils.isTextContent(value)) {
            String stringValue = ContentUtils.getContentStringValue(session.getProgressMonitor(), value);
            map.put("text", stringValue);
        } else {
            map.put("binary", true);
            byte[] binaryValue = ContentUtils.getContentBinaryValue(session.getProgressMonitor(), value);
            if (binaryValue != null) {
                if (binaryValue.length > BINARY_PREVIEW_LENGTH) {
                    binaryValue = Arrays.copyOf(binaryValue, BINARY_PREVIEW_LENGTH);
                }
                map.put("text", GeneralUtils.convertToString(binaryValue, 0, binaryValue.length));
            } else {
                map.put("text", null);
            }
        }
        map.put("contentType", value.getContentType());
        map.put("contentLength", value.getContentLength());
        return map;
    }

    private static Object serializeGeometryValue(DBGeometry value) {
        Map<String, Object> map = createMapOfType("geometry");
        map.put("srid", value.getSRID());
        map.put("text", value.toString());
        map.put("properties", value.getProperties());

        DBGeometry xValue = GisTransformUtils.transformToSRID(value, GisConstants.SRID_4326);
        if (xValue != null && xValue != value) {
            map.put("mapText", xValue.toString());
        }
        return map;
    }

}
