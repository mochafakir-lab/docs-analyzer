import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById, deleteDocument } from '@/lib/document-storage';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const documentId = parseInt(id);

    // Get document by ID
    const document = getDocumentById(documentId);

    if (!document) {
      return NextResponse.json({
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(document, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const documentId = parseInt(id);

    // Check if document exists before deleting

    const existingDocument = getDocumentById(documentId);

    if (!existingDocument) {
      return NextResponse.json({
        error: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND'
      }, { status: 404 });
    }

    // Delete document
    const success = deleteDocument(documentId);

    if (!success) {
      return NextResponse.json({
        error: 'Failed to delete document',
        code: 'DELETE_FAILED'
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Document deleted successfully',
      document: existingDocument
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}