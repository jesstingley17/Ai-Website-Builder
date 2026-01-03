import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { repoUrl } = await req.json();
        
        if (!repoUrl) {
            return NextResponse.json(
                { error: "Repository URL is required" },
                { status: 400 }
            );
        }

        // Parse GitHub URL (supports various formats)
        // Examples: 
        // - https://github.com/owner/repo
        // - github.com/owner/repo
        // - owner/repo
        let owner, repo, path = "";
        
        const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)(?:\/(.+))?/);
        if (urlMatch) {
            owner = urlMatch[1];
            repo = urlMatch[2].replace(/\.git$/, ""); // Remove .git if present
            path = urlMatch[3] || "";
        } else {
            // Try owner/repo format
            const parts = repoUrl.split("/");
            if (parts.length >= 2) {
                owner = parts[0];
                repo = parts[1].replace(/\.git$/, "");
            } else {
                return NextResponse.json(
                    { error: "Invalid repository URL format" },
                    { status: 400 }
                );
            }
        }

        // Use GitHub API (no auth required for public repos, but better with token)
        const githubToken = process.env.GITHUB_TOKEN; // Optional, for rate limits
        const headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Ai-Website-Builder"
        };
        
        if (githubToken) {
            headers["Authorization"] = `token ${githubToken}`;
        }

        // Fetch repository contents
        const apiUrl = path 
            ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
            : `https://api.github.com/repos/${owner}/${repo}/contents`;

        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: "Repository not found or is private. Make sure the repository exists and is public." },
                    { status: 404 }
                );
            }
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();

        // If it's a single file, fetch its content
        if (!Array.isArray(data)) {
            if (data.type === "file") {
                const content = Buffer.from(data.content, "base64").toString("utf-8");
                return NextResponse.json({
                    files: {
                        [data.path]: {
                            code: content,
                            url: data.html_url,
                            name: data.name
                        }
                    },
                    repo: { owner, repo, url: `https://github.com/${owner}/${repo}` }
                });
            }
        }

        // If it's a directory, fetch all files recursively (limit to reasonable size)
        const files = {};
        const maxFiles = 50; // Limit to prevent overwhelming the AI
        let fileCount = 0;

        async function fetchDirectory(url, basePath = "") {
            if (fileCount >= maxFiles) return;
            
            const dirResponse = await fetch(url, { headers });
            if (!dirResponse.ok) return;
            
            const dirData = await dirResponse.json();
            
            for (const item of dirData) {
                if (fileCount >= maxFiles) break;
                
                if (item.type === "file") {
                    // Skip binary files and large files
                    const skipExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip', '.tar', '.gz'];
                    const skip = skipExtensions.some(ext => item.name.endsWith(ext));
                    
                    if (skip || item.size > 100000) continue; // Skip files larger than 100KB
                    
                    try {
                        const fileResponse = await fetch(item.url, { headers });
                        const fileData = await fileResponse.json();
                        const content = Buffer.from(fileData.content, "base64").toString("utf-8");
                        
                        files[item.path] = {
                            code: content,
                            url: item.html_url,
                            name: item.name,
                            size: item.size
                        };
                        fileCount++;
                    } catch (err) {
                        console.error(`Error fetching file ${item.path}:`, err);
                    }
                } else if (item.type === "dir") {
                    // Recursively fetch subdirectories (skip node_modules, .git, etc.)
                    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.DS_Store'];
                    if (!skipDirs.some(dir => item.path.includes(dir))) {
                        await fetchDirectory(item.url, item.path);
                    }
                }
            }
        }

        await fetchDirectory(apiUrl);

        if (Object.keys(files).length === 0) {
            return NextResponse.json(
                { error: "No readable files found in the repository" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            files,
            repo: { owner, repo, url: `https://github.com/${owner}/${repo}` },
            fileCount: Object.keys(files).length
        });

    } catch (error) {
        console.error("GitHub API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch repository" },
            { status: 500 }
        );
    }
}

