param(
    [int]$FirstPr = 37,
    [int]$LastPr = 61,
    [string]$OutputPath = 'docs/cross-review-events.json'
)

# Read public GitHub evidence only. This script never submits reviews or merges.
$ErrorActionPreference = 'Stop'
$repository = 'marouakourdi61-bot/fondations_API_LMS'
$headers = @{ 'User-Agent' = 'LMS-review-evidence'; Accept = 'application/vnd.github+json' }
if ($env:GITHUB_TOKEN) { $headers.Authorization = "Bearer $env:GITHUB_TOKEN" }
$base = "https://api.github.com/repos/$repository"

function Read-Pages([string]$Url) {
    $items = @()
    $page = 1
    do {
        $separator = if ($Url.Contains('?')) { '&' } else { '?' }
        $batch = Invoke-RestMethod -Uri "${Url}${separator}per_page=100&page=$page" -Headers $headers
        foreach ($item in $batch) {
            if ($null -ne $item) { $items += $item }
        }
        $page++
    } while ($batch.Count -eq 100)
    foreach ($item in $items) { Write-Output $item }
}

$pulls = @(Read-Pages "$base/pulls?state=closed&sort=created&direction=desc")
$records = foreach ($pr in ($pulls | Where-Object {
    $_.number -ge $FirstPr -and $_.number -le $LastPr -and $_.merged_at
} | Sort-Object number)) {
    $errors = @()
    $reviews = @()
    $comments = @()
    $discussion = @()
    $timeline = @()
    try { $reviews = @(Read-Pages "$base/pulls/$($pr.number)/reviews") }
    catch { $errors += "Review retrieval failed: $($_.Exception.Message)" }
    try { $comments = @(Read-Pages "$base/pulls/$($pr.number)/comments") }
    catch { $errors += "Comment retrieval failed: $($_.Exception.Message)" }
    try { $discussion = @(Read-Pages "$base/issues/$($pr.number)/comments") }
    catch { $errors += "Discussion retrieval failed: $($_.Exception.Message)" }
    try { $timeline = @(Read-Pages "$base/issues/$($pr.number)/timeline") }
    catch { $errors += "Timeline retrieval failed: $($_.Exception.Message)" }
    $crossReviews = @($reviews | Where-Object {
        $_.user.login -ne $pr.user.login -and $_.submitted_at -and
        ([datetimeoffset]$_.submitted_at -lt [datetimeoffset]$pr.merged_at) -and
        $_.state -in @('APPROVED', 'CHANGES_REQUESTED', 'COMMENTED')
    })
    [ordered]@{
        number = $pr.number
        title = $pr.title
        url = $pr.html_url
        author = $pr.user.login
        mergedAt = $pr.merged_at
        mergeCommit = $pr.merge_commit_sha
        mergeCommitUrl = "https://github.com/$repository/commit/$($pr.merge_commit_sha)"
        verdict = if ($errors.Count) { 'incomplete retrieval' } elseif ($crossReviews.Count) { 'pre-merge cross-review recorded' } else { 'no submitted pre-merge cross-review found' }
        retrievalErrors = $errors
        discussionComments = @($discussion | ForEach-Object {
            [ordered]@{ author = $_.user.login; createdAt = $_.created_at; url = $_.html_url; body = $_.body }
        })
        mergeEvents = @($timeline | Where-Object { $_.event -eq 'merged' } | ForEach-Object {
            [ordered]@{ id = $_.id; actor = $_.actor.login; createdAt = $_.created_at; apiUrl = $_.url; commit = $_.commit_id }
        })
        reviews = @($reviews | ForEach-Object {
            [ordered]@{ id = $_.id; reviewer = $_.user.login; state = $_.state; submittedAt = $_.submitted_at; url = $_.html_url; body = $_.body; commit = $_.commit_id }
        })
        inlineComments = @($comments | ForEach-Object {
            [ordered]@{ id = $_.id; author = $_.user.login; createdAt = $_.created_at; url = $_.html_url; body = $_.body; path = $_.path; replyTo = $_.in_reply_to_id; commit = $_.commit_id }
        })
    }
}

$report = [ordered]@{
    collectedAt = [datetimeoffset]::UtcNow.ToString('o')
    repository = $repository
    scope = "Selected merged PRs #$FirstPr through #$LastPr. Scope agreement is recorded separately in docs/cross-review-evidence.md."
    limitations = @(
        'REST inline comments do not expose review-thread resolved status; resolution needs timeline/thread inspection.',
        'No submitted review is not proof that no informal review occurred.',
        'A recorded cross-review is not necessarily approval of the final revision.',
        'No reviews, comments, approvals or merges were submitted by this script.'
    )
    pullRequests = @($records)
}
$report | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $OutputPath -Encoding utf8
Write-Output "Saved $(@($records).Count) PR records to $OutputPath"
