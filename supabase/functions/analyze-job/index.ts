import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalysisResult {
  ats_score: number;
  match_score: number;
  strengths: string[];
  gaps: string[];
  keywords: {
    found: string[];
    missing: string[];
  };
  recommendations: string[];
}

function extractKeywords(text: string): Set<string> {
  const commonSkills = [
    'python', 'javascript', 'java', 'c++', 'react', 'angular', 'vue', 'node',
    'sql', 'postgresql', 'mysql', 'mongodb', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'git', 'agile', 'scrum', 'typescript', 'html', 'css',
    'rest', 'graphql', 'api', 'microservices', 'ci/cd', 'linux', 'terraform',
    'machine learning', 'ai', 'data science', 'analytics', 'leadership',
    'project management', 'communication', 'teamwork', 'problem solving',
  ];

  const textLower = text.toLowerCase();
  const found = new Set<string>();

  commonSkills.forEach((skill) => {
    if (textLower.includes(skill)) {
      found.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return found;
}

function calculateATSScore(resumeContent: string, jobDescription: string): number {
  const resumeKeywords = extractKeywords(resumeContent);
  const jobKeywords = extractKeywords(jobDescription);

  let matchCount = 0;
  jobKeywords.forEach((keyword) => {
    if (resumeKeywords.has(keyword)) {
      matchCount++;
    }
  });

  const keywordScore = jobKeywords.size > 0 ? (matchCount / jobKeywords.size) * 100 : 50;

  // Check for formatting patterns
  let formatScore = 70;
  if (resumeContent.includes('@')) formatScore += 5;
  if (resumeContent.includes('experience') || resumeContent.includes('Experience')) formatScore += 5;
  if (resumeContent.includes('education') || resumeContent.includes('Education')) formatScore += 5;
  if (resumeContent.includes('skills') || resumeContent.includes('Skills')) formatScore += 5;
  if (/\d{4}/.test(resumeContent)) formatScore += 5;

  const finalScore = Math.round((keywordScore * 0.7) + (formatScore * 0.3));
  return Math.min(Math.max(finalScore, 0), 100);
}

function calculateMatchScore(resumeContent: string, jobDescription: string): number {
  const resumeKeywords = extractKeywords(resumeContent);
  const jobKeywords = extractKeywords(jobDescription);

  let matchCount = 0;
  let missCount = 0;
  const missing: string[] = [];

  jobKeywords.forEach((keyword) => {
    if (resumeKeywords.has(keyword)) {
      matchCount++;
    } else {
      missCount++;
      missing.push(keyword);
    }
  });

  const score = jobKeywords.size > 0
    ? Math.round((matchCount / jobKeywords.size) * 100)
    : 50;

  return Math.min(Math.max(score, 0), 100);
}

function analyzeResume(
  resumeContent: string,
  jobDescription: string
): AnalysisResult {
  const atsScore = calculateATSScore(resumeContent, jobDescription);
  const matchScore = calculateMatchScore(resumeContent, jobDescription);

  const resumeKeywords = extractKeywords(resumeContent);
  const jobKeywords = extractKeywords(jobDescription);

  const found: string[] = [];
  const missing: string[] = [];

  jobKeywords.forEach((keyword) => {
    if (resumeKeywords.has(keyword)) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const strengths: string[] = [];
  const gaps: string[] = [];
  const recommendations: string[] = [];

  if (found.length > 0) {
    strengths.push(`Strong match for ${found.slice(0, 3).join(', ')}`);
  }
  if (resumeContent.toLowerCase().includes('experience')) {
    strengths.push('Clear experience section with relevant background');
  }
  if (resumeContent.toLowerCase().includes('education')) {
    strengths.push('Education section present and complete');
  }

  if (missing.length > 0) {
    gaps.push(`Missing key skills: ${missing.slice(0, 3).join(', ')}`);
  }
  if (!/\d+[%$]/.test(resumeContent)) {
    gaps.push('Lacks quantifiable achievements with metrics');
  }

  recommendations.push('Add specific metrics to demonstrate impact (e.g., "Increased sales by 25%")');
  if (missing.length > 0) {
    recommendations.push(`Highlight experience with ${missing[0]} if applicable`);
  }
  recommendations.push('Ensure keywords from job description appear naturally in your resume');

  return {
    ats_score: atsScore,
    match_score: matchScore,
    strengths,
    gaps,
    keywords: { found, missing },
    recommendations,
  };
}

function generateTailoredResume(
  resumeContent: string,
  jobDescription: string,
  analysis: AnalysisResult
): string {
  const missingKeywords = analysis.keywords.missing.slice(0, 3);

  return `PROFESSIONAL SUMMARY
Experienced professional with proven expertise matching ${analysis.keywords.found.slice(0, 3).join(', ') || 'key skills'}.
${missingKeywords.length > 0 ? `Familiar with ${missingKeywords.join(', ')} and eager to apply these skills.` : ''}

CORE COMPETENCIES
${analysis.keywords.found.slice(0, 8).map(k => `- ${k}`).join('\n')}

PROFESSIONAL EXPERIENCE

Senior Professional | Current Company | 2020 - Present
- Led initiatives resulting in measurable business improvements
- Collaborated with cross-functional teams to deliver projects on time
- Applied ${analysis.keywords.found[0] || 'technical skills'} to solve complex challenges

Previous Role | Previous Company | 2018 - 2020
- Contributed to team success through innovative problem-solving
- Developed and maintained key systems and processes

EDUCATION
Bachelor's Degree in Relevant Field
University Name | Year

ADDITIONAL INFORMATION
- Strong analytical and problem-solving abilities
- Excellent communication and teamwork skills
- Committed to continuous learning and professional development`;
}

function extractJobTitle(desc: string): string {
  const patterns = [
    /position:\s*([^\n]+)/i,
    /title:\s*([^\n]+)/i,
    /role:\s*([^\n]+)/i,
    /job title:\s*([^\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = desc.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 100);
    }
  }

  return 'Position';
}

function extractCompanyName(desc: string): string {
  const patterns = [
    /company:\s*([^\n]+)/i,
    /at\s+([A-Z][A-Za-z0-9\s]+?)(?:\s+(?:is|we|our|looking|seeking))/,
  ];

  for (const pattern of patterns) {
    const match = desc.match(pattern);
    if (match) {
      return match[1].trim().substring(0, 100);
    }
  }

  return 'Company';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { resumeId, jobDescription } = body;

    if (!resumeId || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("content, filename")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return new Response(
        JSON.stringify({ error: "Resume not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resumeContent = resume.content || resume.filename;
    const analysis = analyzeResume(resumeContent, jobDescription);
    const tailoredResume = generateTailoredResume(resumeContent, jobDescription, analysis);

    const jobTitle = extractJobTitle(jobDescription);
    const companyName = extractCompanyName(jobDescription);

    const { data: savedAnalysis, error: saveError } = await supabase
      .from("job_analyses")
      .insert({
        user_id: user.id,
        resume_id: resumeId,
        job_description: jobDescription,
        job_title: jobTitle,
        company_name: companyName,
        ats_score: analysis.ats_score,
        match_score: analysis.match_score,
        analysis_result: {
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          keywords: analysis.keywords,
          recommendations: analysis.recommendations,
        },
        tailored_resume: tailoredResume,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
    }

    return new Response(
      JSON.stringify(savedAnalysis || {
        id: crypto.randomUUID(),
        ats_score: analysis.ats_score,
        match_score: analysis.match_score,
        job_title: jobTitle,
        company_name: companyName,
        analysis_result: {
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          keywords: analysis.keywords,
          recommendations: analysis.recommendations,
        },
        tailored_resume: tailoredResume,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
