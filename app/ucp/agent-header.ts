/**
 * Parses the UCP-Agent header using Dictionary Structured Field syntax
 * Expected format: profile="https://platform.example/profile"
 * 
 * Reference: RFC 8941 - Structured Field Values for HTTP
 */
export function parseUCPAgentHeader(headerValue: string | null): {
  profile: string;
} | null {
  if (!headerValue) {
    return null;
  }

  // Dictionary Structured Field format: key="value" or key=value
  // For UCP-Agent: profile="https://platform.example/profile"
  const profileMatch = headerValue.match(/profile\s*=\s*"([^"]+)"/);
  
  if (!profileMatch || !profileMatch[1]) {
    // Try without quotes as fallback
    const unquotedMatch = headerValue.match(/profile\s*=\s*([^\s,]+)/);
    if (unquotedMatch && unquotedMatch[1]) {
      return { profile: unquotedMatch[1] };
    }
    return null;
  }

  const profileUrl = profileMatch[1];
  
  // Validate it's a valid URL
  try {
    new URL(profileUrl);
    return { profile: profileUrl };
  } catch {
    return null;
  }
}

/**
 * Validates and extracts the UCP-Agent header from a request
 * Returns the profile URI or throws an error response
 */
export function validateUCPAgentHeader(
  request: Request
): { profile: string } | Response {
  const agentHeader = request.headers.get("UCP-Agent");
  const parsed = parseUCPAgentHeader(agentHeader);

  if (!parsed) {
    return Response.json(
      {
        status: "requires_escalation",
        messages: [
          {
            type: "error",
            code: "invalid",
            content_type: "plain",
            content:
              'Missing or invalid UCP-Agent header. Expected format: UCP-Agent: profile="https://platform.example/profile"',
            severity: "requires_escalation",
          },
        ],
      },
      { status: 400 }
    );
  }

  return parsed;
}

