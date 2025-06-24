[CmdletBinding(SupportsShouldProcess = $true)]
param (
    [Parameter(Mandatory = $false, Position = 0, HelpMessage = "The name for the new project directory. If not provided, setup will be in the current directory if empty.")]
    [string]$ProjectName,

    [Parameter(Mandatory = $false, HelpMessage = "Skip confirmation prompts.")]
    [switch]$y
)

# --- Define Configuration ---
$RepoURL = "https://github.com/Carter-75/setup.git"

# --- Helper Functions ---
function Write-StyledHeader {
    param ([string]$Message)
    Write-Host "
====================================================
$Message
====================================================" -ForegroundColor Cyan
}

function Write-StyledSubHeader {
    param ([string]$Message)
    Write-Host "
--- $Message ---" -ForegroundColor Yellow
}

function Update-ProjectMetadata {
    param (
        [string]$projectPath,
        [string]$projectName
    )
    $layoutFilePath = Join-Path -Path $projectPath -ChildPath "src\app\layout.tsx"
    if (Test-Path $layoutFilePath) {
        Write-StyledSubHeader "2. Updating project metadata"
        (Get-Content $layoutFilePath -Raw) -replace 'title: "Crash Cart"', "title: ""$projectName""" `
                                          -replace 'description: "A fun physics-based game."', "description: ""A project named $projectName""" | Set-Content $layoutFilePath -Force
        Write-Host "✅ Project title and description updated."
    }
}

# --- Main Script ---

Write-StyledHeader "Project Setup from GitHub Repository"

# Case 1: Project name is provided as an argument
if ($ProjectName) {
    $targetPath = Join-Path -Path (Get-Location).Path -ChildPath $ProjectName
    if (Test-Path $targetPath) {
        Write-Error "A directory named '$ProjectName' already exists. Please choose a different name or remove the existing directory."
        exit
    }

    if ($PSCmdlet.ShouldProcess($targetPath, "Setup Project from $RepoURL")) {
        Write-StyledSubHeader "1. Cloning project from GitHub into '$ProjectName'"
        git clone $RepoURL $ProjectName | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to clone the repository. Please check the URL and your internet connection."
            if (Test-Path $targetPath) { Remove-Item -Recurse -Force $targetPath }
            exit
        }
        Write-Host "✅ Project files cloned successfully."

        Update-ProjectMetadata -projectPath $targetPath -projectName $ProjectName

        Set-Location $targetPath

        Write-StyledSubHeader "3. Installing dependencies"
        Write-Host "This might take a few minutes..."
        npm install | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed. Please check for errors in the output."
            exit
        }
        Write-Host "✅ Dependencies installed."

        Write-StyledHeader "🎉 Setup Complete! 🎉"
        Write-Host "
Your project is ready in '$((Get-Location).Path)'.

To get started, you are now in the project directory.
Just run the development server (with Turbopack!):
  npm run dev

Happy coding!
"
    }
}
else {
    $currentPath = (Get-Location).Path
    $items = Get-ChildItem -Path $currentPath -Force -Exclude $MyInvocation.MyCommand.Name
    
    # Case 2: No project name, but current directory is not empty
    if ($items) {
        $NewProjectName = Read-Host "The current directory is not empty. Please enter a name for the new project folder"
        if ([string]::IsNullOrWhiteSpace($NewProjectName)) {
            Write-Error "Project name cannot be empty. Aborting setup."
            exit
        }

        $targetPath = Join-Path -Path $currentPath -ChildPath $NewProjectName
        if (Test-Path $targetPath) {
            Write-Error "A directory named '$NewProjectName' already exists. Please choose a different name or remove the existing directory."
            exit
        }

        if ($PSCmdlet.ShouldProcess($targetPath, "Setup Project from $RepoURL")) {
            Write-StyledSubHeader "1. Cloning project from GitHub into '$NewProjectName'"
            git clone $RepoURL $NewProjectName | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to clone the repository. Please check the URL and your internet connection."
                if (Test-Path $targetPath) { Remove-Item -Recurse -Force $targetPath }
                exit
            }
            Write-Host "✅ Project files cloned successfully."

            Update-ProjectMetadata -projectPath $targetPath -projectName $NewProjectName

            Set-Location $targetPath

            Write-StyledSubHeader "3. Installing dependencies"
            Write-Host "This might take a few minutes..."
            npm install | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Error "npm install failed. Please check for errors in the output."
                exit
            }
            Write-Host "✅ Dependencies installed."

            Write-StyledHeader "🎉 Setup Complete! 🎉"
            Write-Host "
Your project is ready in '$((Get-Location).Path)'.

To get started, you are now in the project directory.
Just run the development server (with Turbopack!):
  npm run dev

Happy coding!
"
        }
    }
    # Case 3: No project name, and current directory is empty
    else {
        $targetPath = $currentPath
        $currentFolderName = Split-Path -Path $targetPath -Leaf

        if ($PSCmdlet.ShouldProcess($targetPath, "Setup project from $RepoURL in current directory '$currentFolderName'")) {
            Write-StyledSubHeader "1. Cloning project from GitHub into '$currentFolderName'"
            
            $tempDirName = [System.IO.Path]::GetRandomFileName()
            $tempDirPath = Join-Path -Path $targetPath -ChildPath $tempDirName
            
            try {
                git clone --depth 1 $RepoURL $tempDirPath | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    Write-Error "Failed to clone the repository. Please check the URL and your internet connection."
                    exit
                }

                Move-Item -Path (Join-Path $tempDirPath "*") -Destination $targetPath -Force
                Move-Item -Path (Join-Path $tempDirPath ".*") -Destination $targetPath -Force -ErrorAction SilentlyContinue
            }
            finally {
                if (Test-Path $tempDirPath) {
                    Remove-Item -Recurse -Force $tempDirPath
                }
            }
            Write-Host "✅ Project files cloned successfully."

            Update-ProjectMetadata -projectPath $targetPath -projectName $currentFolderName

            Write-StyledSubHeader "3. Installing dependencies"
            Write-Host "This might take a few minutes..."
            npm install | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Error "npm install failed. Please check for errors in the output."
                exit
            }
            Write-Host "✅ Dependencies installed."

            Write-StyledHeader "🎉 Setup Complete! 🎉"
            Write-Host "
Your project is ready in '$((Get-Location).Path)'.

To get started, just run the development server (with Turbopack!):
  npm run dev

Happy coding!
"
        }
    }
} 