# GitHub Repository Integration

This application now supports using GitHub repositories as a reference or base for code generation.

## Features

- **Fetch Repository Contents**: Input a GitHub repository URL and the app will fetch its contents
- **Context-Aware Generation**: The AI will use the repository structure and code as context when generating new code
- **Support for Public Repositories**: Works with any public GitHub repository
- **Smart File Filtering**: Automatically filters out binary files, large files, and common directories (node_modules, .git, etc.)

## How to Use

1. **Start Creating a Project**:
   - On the homepage, you'll see a new "Use GitHub Repository (optional)" section
   
2. **Enter Repository URL**:
   - Format: `github.com/owner/repo` or `owner/repo`
   - Examples:
     - `github.com/vercel/next.js`
     - `facebook/react`
     - `https://github.com/tailwindlabs/tailwindcss`

3. **Load Repository**:
   - Click the GitHub icon button to fetch the repository
   - The app will load up to 50 files from the repository (excluding binary files and large files)

4. **Generate Code**:
   - Enter your project description/prompt
   - The AI will use the repository as context when generating code
   - The generated code will be inspired by the repository's structure and patterns

## GitHub Token (Optional but Recommended)

While the GitHub integration works without authentication, using a GitHub token provides:
- **Higher Rate Limits**: 5,000 requests/hour (vs 60 requests/hour without token)
- **Access to Private Repositories**: If you have the token with appropriate permissions

### Setting Up GitHub Token

1. **Create a Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name (e.g., "Ai-Website-Builder")
   - Select scopes:
     - `public_repo` - for public repositories
     - `repo` - for private repositories (requires full repo access)
   - Click "Generate token"
   - **Copy the token immediately** (you won't be able to see it again)

2. **Add to Environment Variables**:
   - **Local Development**: Add to `.env.local`:
     ```
     GITHUB_TOKEN=your_token_here
     ```
   
   - **Vercel Deployment**: Add to Vercel environment variables:
     - Go to your Vercel project → Settings → Environment Variables
     - Add: `GITHUB_TOKEN` with your token value

## Limitations

- Only works with **public repositories** (unless you use a GitHub token with private repo access)
- Maximum of **50 files** are loaded per repository (to prevent overwhelming the AI)
- Binary files (images, fonts, etc.) are automatically skipped
- Files larger than 100KB are skipped
- Common directories like `node_modules`, `.git`, `dist`, `build` are excluded

## Technical Details

- Uses GitHub REST API v3
- Files are fetched recursively from the repository
- File contents are base64 decoded from the API response
- Repository context is included in the AI prompt for code generation

## Examples

### Using a React Component Library
```
Repository: github.com/headlessui/react
Prompt: "Create a login form with validation using similar patterns"
```

### Using a UI Framework
```
Repository: github.com/tailwindlabs/tailwindcss
Prompt: "Build a landing page with similar styling approach"
```

### Using a Specific Project Structure
```
Repository: github.com/your-username/your-project
Prompt: "Create a similar project structure but for a todo app"
```

