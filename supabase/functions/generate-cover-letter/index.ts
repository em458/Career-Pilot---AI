import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function extractKeywords(text: string): string[] {
  const commonSkills = [
    'python', 'javascript', 'java', 'c++', 'react', 'angular', 'vue', 'node',
    'sql', 'postgresql', 'mysql', 'mongodb', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'git', 'agile', 'scrum', 'typescript', 'leadership',
    'project management', 'communication', 'teamwork', 'problem solving',
    'analytics', 'data science', 'machine learning', 'ai', 'collaboration',
  ];

  const textLower = text.toLowerCase();
  const found: string[] = [];

  commonSkills.forEach((skill) => {
    if (textLower.includes(skill)) {
      found.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return found;
}

function generateCoverLetter(
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  resumeContent: string | null
): string {
  const position = jobTitle || 'the advertised position';
  const company = companyName || 'your organization';

  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = resumeContent ? extractKeywords(resumeContent) : [];

  const matchedSkills = jobKeywords.filter(k => resumeKeywords.includes(k)).slice(0, 4);
  const additionalSkills = resumeKeywords.filter(k => !jobKeywords.includes(k)).slice(0, 3);

  let skillsPara = '';
  if (matchedSkills.length > 0) {
    skillsPara = `My expertise in ${matchedSkills.join(', ')} directly aligns with the requirements you've outlined for this role.`;
  }
  if (additionalSkills.length > 0) {
    skillsPara += matchedSkills.length > 0
      ? ` Additionally, my background in ${additionalSkills.join(', ')} would bring valuable perspective to your team.`
      : `I bring strong skills in ${additionalSkills.join(', ')}, which would complement your team's capabilities.`;
  }

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${position} role at ${company}. After carefully reviewing the position requirements, I am confident that my background and skills make me an excellent candidate for this opportunity.

${skillsPara || 'My professional experience has equipped me with the skills and knowledge necessary to excel in this role and contribute meaningfully to your team.'}

Throughout my career, I have consistently demonstrated my ability to deliver results while maintaining a focus on collaboration and continuous improvement. Some of my key achievements include:

- Successfully leading cross-functional initiatives that improved team efficiency
- Developing and implementing solutions that addressed complex business challenges
- Building strong relationships with stakeholders across multiple departments
- Maintaining a commitment to professional growth and staying current with industry best practices

I am particularly drawn to ${company} because of your commitment to excellence and innovation. The opportunity to contribute to your team's success while further developing my skills aligns perfectly with my career goals.

I would welcome the opportunity to discuss how my experience and enthusiasm could benefit ${company}. Thank you for considering my application. I look forward to the possibility of speaking with you soon.

Sincerely,
[Your Name]`;
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
    const { resumeId, jobDescription, jobTitle, companyName } = body;

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
      .maybeSingle();

    if (resumeError) {
      console.error("Resume fetch error:", resumeError);
    }

    const resumeContent = resume?.content || resume?.filename || null;
    const coverLetter = generateCoverLetter(
      jobDescription,
      jobTitle || '',
      companyName || '',
      resumeContent
    );

    return new Response(
      JSON.stringify({
        coverLetter,
        wordCount: coverLetter.split(/\s+/).length,
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
