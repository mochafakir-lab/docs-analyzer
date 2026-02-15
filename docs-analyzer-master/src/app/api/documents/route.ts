import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getDocumentById, addDocument, updateDocument, deleteDocument } from '@/lib/document-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Handle single document fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const document = getDocumentById(parseInt(id));

      if (!document) {
        return NextResponse.json({ 
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(document);
    }

    // Handle list with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let results = getDocuments();

    // Apply search filter
    if (search) {
      results = results.filter(doc => 
        doc.originalName.toLowerCase().includes(search.toLowerCase()) ||
        doc.filename.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by upload date (newest first)
    results.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);

    return NextResponse.json(paginatedResults);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { 
      filename, 
      originalName, 
      fileSize, 
      mimeType, 
      filePath, 
      status 
    } = requestBody;

    // Validate required fields
    if (!filename) {
      return NextResponse.json({ 
        error: "Filename is required",
        code: "MISSING_FILENAME" 
      }, { status: 400 });
    }

    if (!originalName) {
      return NextResponse.json({ 
        error: "Original name is required",
        code: "MISSING_ORIGINAL_NAME" 
      }, { status: 400 });
    }

    if (!fileSize) {
      return NextResponse.json({ 
        error: "File size is required",
        code: "MISSING_FILE_SIZE" 
      }, { status: 400 });
    }

    if (!mimeType) {
      return NextResponse.json({ 
        error: "MIME type is required",
        code: "MISSING_MIME_TYPE" 
      }, { status: 400 });
    }

    if (!filePath) {
      return NextResponse.json({ 
        error: "File path is required",
        code: "MISSING_FILE_PATH" 
      }, { status: 400 });
    }

    // Validate fileSize is positive integer
    if (fileSize <= 0 || !Number.isInteger(fileSize)) {
      return NextResponse.json({ 
        error: "File size must be a positive integer",
        code: "INVALID_FILE_SIZE" 
      }, { status: 400 });
    }

    // Validate status if provided
    const validStatuses = ['processing', 'completed', 'error'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Status must be one of: processing, completed, error",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate MIME type format (basic check)
    const mimeTypePattern = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/;
    if (!mimeTypePattern.test(mimeType)) {
      return NextResponse.json({ 
        error: "Invalid MIME type format",
        code: "INVALID_MIME_TYPE" 
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();
    
    const insertData = {
      filename: filename.trim(),
      originalName: originalName.trim(),
      fileSize,
      mimeType: mimeType.trim(),
      filePath: filePath.trim(),
      status: status || 'processing',
      uploadDate: currentTimestamp,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    };

    const newDocument = addDocument(insertData);

    return NextResponse.json(newDocument, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Check if document exists
    const existingDocument = getDocumentById(parseInt(id));

    if (!existingDocument) {
      return NextResponse.json({ 
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and update fields if provided
    if (requestBody.filename !== undefined) {
      if (!requestBody.filename) {
        return NextResponse.json({ 
          error: "Filename cannot be empty",
          code: "EMPTY_FILENAME" 
        }, { status: 400 });
      }
      updates.filename = requestBody.filename.trim();
    }

    if (requestBody.originalName !== undefined) {
      if (!requestBody.originalName) {
        return NextResponse.json({ 
          error: "Original name cannot be empty",
          code: "EMPTY_ORIGINAL_NAME" 
        }, { status: 400 });
      }
      updates.originalName = requestBody.originalName.trim();
    }

    if (requestBody.fileSize !== undefined) {
      if (requestBody.fileSize <= 0 || !Number.isInteger(requestBody.fileSize)) {
        return NextResponse.json({ 
          error: "File size must be a positive integer",
          code: "INVALID_FILE_SIZE" 
        }, { status: 400 });
      }
      updates.fileSize = requestBody.fileSize;
    }

    if (requestBody.mimeType !== undefined) {
      if (!requestBody.mimeType) {
        return NextResponse.json({ 
          error: "MIME type cannot be empty",
          code: "EMPTY_MIME_TYPE" 
        }, { status: 400 });
      }
      const mimeTypePattern = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$/;
      if (!mimeTypePattern.test(requestBody.mimeType)) {
        return NextResponse.json({ 
          error: "Invalid MIME type format",
          code: "INVALID_MIME_TYPE" 
        }, { status: 400 });
      }
      updates.mimeType = requestBody.mimeType.trim();
    }

    if (requestBody.filePath !== undefined) {
      if (!requestBody.filePath) {
        return NextResponse.json({ 
          error: "File path cannot be empty",
          code: "EMPTY_FILE_PATH" 
        }, { status: 400 });
      }
      updates.filePath = requestBody.filePath.trim();
    }

    if (requestBody.status !== undefined) {
      const validStatuses = ['processing', 'completed', 'error'];
      if (!validStatuses.includes(requestBody.status)) {
        return NextResponse.json({ 
          error: "Status must be one of: processing, completed, error",
          code: "INVALID_STATUS" 
        }, { status: 400 });
      }
      updates.status = requestBody.status;
    }

    const updated = updateDocument(parseInt(id), updates);

    if (!updated) {
      return NextResponse.json({ 
        error: 'Failed to update document',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updated);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if document exists before deleting
    const existingDocument = getDocumentById(parseInt(id));

    if (!existingDocument) {
      return NextResponse.json({ 
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND' 
      }, { status: 404 });
    }

    const success = deleteDocument(parseInt(id));

    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to delete document',
        code: 'DELETE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Document deleted successfully',
      document: existingDocument
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}