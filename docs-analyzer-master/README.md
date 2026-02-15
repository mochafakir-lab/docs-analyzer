# Legal AI Platform

A full-stack Legal AI platform powered by Google's Gemini API that helps legal professionals analyze documents, extract information, identify risks, and get insights without building custom ML models.

## Features

- 🔍 **Smart Document Analysis** - Automatically analyze legal documents and contracts with AI
- 📋 **Clause Extraction** - Extract key clauses, terms, and entities from documents
- ⚠️ **Risk Assessment** - Identify potential legal risks and compliance issues
- 💬 **Q&A Chat Interface** - Ask questions about documents and get instant AI-powered answers
- 📊 **Document Comparison** - Compare multiple documents side-by-side
- 📁 **Document Management** - Upload, organize, and manage legal documents
- 🎨 **Modern UI** - Built with Next.js 15, React, TypeScript, and shadcn/ui

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **AI:** Google Gemini API
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd legal-ai-platform
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Google Gemini API key to `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

To get a Gemini API key:
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Sign in with your Google account
- Click "Create API Key"
- Copy and paste the key into your `.env.local` file

5. Run the development server:
```bash
npm run dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
legal-ai-platform/
├── src/
│   ├── app/
│   │   ├── api/                  # API routes for Gemini integration
│   │   │   ├── analyze/          # Document analysis endpoint
│   │   │   ├── extract-clauses/  # Clause extraction endpoint
│   │   │   ├── chat/             # Q&A chat endpoint
│   │   │   └── compare/          # Document comparison endpoint
│   │   ├── dashboard/            # Document dashboard page
│   │   ├── upload/               # Document upload page
│   │   ├── analysis/[id]/        # Document analysis view
│   │   ├── compare/              # Document comparison view
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   └── LoadingSpinner.tsx    # Loading components
│   └── lib/
│       └── document-utils.ts     # Document utility functions
├── public/                       # Static assets
├── .env.example                  # Environment variables example
└── README.md                     # This file
```

## API Endpoints

### POST /api/analyze
Analyzes a legal document and provides comprehensive insights.

**Request:**
```json
{
  "documentText": "string",
  "documentType": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "overview": { /* document overview */ },
    "keyClauses": [ /* extracted clauses */ ],
    "risks": [ /* identified risks */ ],
    "financialTerms": { /* financial information */ }
  }
}
```

### POST /api/extract-clauses
Extracts and categorizes clauses from a document.

**Request:**
```json
{
  "documentText": "string"
}
```

### POST /api/chat
Chat with AI about a specific document.

**Request:**
```json
{
  "documentText": "string",
  "question": "string",
  "conversationHistory": [ /* optional */ ]
}
```

### POST /api/compare
Compares two documents side-by-side.

**Request:**
```json
{
  "document1Text": "string",
  "document2Text": "string",
  "document1Name": "string (optional)",
  "document2Name": "string (optional)"
}
```

## Features in Detail

### Document Upload
- Drag-and-drop interface
- Support for PDF, DOCX, and TXT files
- File size validation (max 10MB)
- Upload progress tracking
- Multiple file uploads

### Dashboard
- View all uploaded documents
- Search and filter documents
- Document statistics and analytics
- Quick actions (view, download, delete)
- Document comparison selection

### Document Analysis
- Comprehensive document overview
- Key clauses extraction with categorization
- Risk assessment with severity levels
- Financial terms breakdown
- AI-powered Q&A chat interface

### Document Comparison
- Side-by-side document comparison
- Highlight differences and similarities
- Categorized comparison items
- Key differences summary
- Export comparison reports

## Customization

### Adding New Document Types

Edit `src/lib/document-utils.ts` to add new document categories:

```typescript
export const DOCUMENT_CATEGORIES = [
  'Your New Category',
  // ... existing categories
] as const;
```

### Modifying AI Prompts

Edit the API route files in `src/app/api/` to customize how the AI analyzes documents.

### Styling

The project uses Tailwind CSS v4. Edit `src/app/globals.css` to customize:
- Color schemes
- Typography
- Spacing
- Dark mode styles

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your `GEMINI_API_KEY` in the environment variables
4. Deploy

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js 15:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | No |

## Known Limitations

- File parsing for PDF and DOCX files requires additional libraries (currently placeholder)
- Documents are not persisted (add database integration for production)
- No user authentication (implement auth for multi-user scenarios)
- File uploads are simulated (integrate with cloud storage for production)

## Roadmap

- [ ] Add database integration for document persistence
- [ ] Implement user authentication and authorization
- [ ] Add real file upload with cloud storage
- [ ] Implement PDF and DOCX parsing libraries
- [ ] Add export functionality for analysis reports
- [ ] Support for more document types
- [ ] Batch document processing
- [ ] Document version control
- [ ] Collaborative features
- [ ] Advanced analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API documentation

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Google Gemini API](https://ai.google.dev/)
- Icons by [Lucide](https://lucide.dev/)