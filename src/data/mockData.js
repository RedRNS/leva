export const mockTools = [
  { id: 1, name: "Perplexity AI", category: "Research", iconKey: "search", url: "perplexity.ai", desc: "AI-powered search engine with verified sources. Ideal for quick literature reviews.", detailDesc: "Great for finding initial sources for assignments, as answers come with citations you can verify directly. The free version is sufficient for daily research, with advanced features available in paid plans.", pricingType: "freemium", rating: 4.8, major: ["Computer Science", "Law", "All"] },
  { id: 7, name: "Consensus", category: "Research", iconKey: "search", url: "consensus.app", desc: "Find answers from thousands of peer-reviewed academic papers instantly.", detailDesc: "Focused on concise, evidence-based answers from scientific journals. Can be used for free for basic search needs.", pricingType: "free", rating: 4.5, major: ["All"] },
  { id: 2, name: "GitHub Copilot", category: "Coding", iconKey: "code", url: "github.com/copilot", desc: "AI coding assistant from GitHub that helps with autocomplete and real-time code debugging.", detailDesc: "Highly productive for pair programming during labs or coding projects. Best performance available through a paid subscription.", pricingType: "paid", rating: 4.9, major: ["Computer Science", "Information Systems"] },
  { id: 8, name: "Codeium", category: "Coding", iconKey: "code", url: "codeium.com", desc: "Free Copilot alternative with multi-language AI coding capabilities.", detailDesc: "An economical choice for auto-complete and daily coding assistance. Great when you need a non-paywall option.", pricingType: "free", rating: 4.4, major: ["Computer Science", "Information Systems"] },
  { id: 3, name: "Scite.ai", category: "Academic", iconKey: "book", url: "scite.ai", desc: "Find and evaluate scientific references with citation context directly from the original papers.", detailDesc: "Helps distinguish papers that support or contradict research findings. Basic version available, full analysis features in premium plan.", pricingType: "freemium", rating: 4.6, major: ["All"] },
  { id: 5, name: "Grammarly", category: "Writing", iconKey: "pencil", url: "grammarly.com", desc: "Automatically check grammar, tone, and clarity of your academic writing.", detailDesc: "Effective for polishing reports and academic emails. Basic corrections are free, advanced suggestions available in the premium plan.", pricingType: "freemium", rating: 4.7, major: ["All"] },
  { id: 4, name: "Julius AI", category: "Data", iconKey: "bar-chart", url: "julius.ai", desc: "Analyze data and create visualizations simply by uploading a spreadsheet and asking in natural language.", detailDesc: "Practical for students who need quick data insights without extensive coding. Free plan available, larger capacity in paid plans.", pricingType: "freemium", rating: 4.5, major: ["Computer Science", "Management", "Accounting", "Business Administration", "Mathematics", "Sociology"] },
  { id: 6, name: "Notion AI", category: "Productivity", iconKey: "grid", url: "notion.so", desc: "All-in-one workspace with integrated AI for writing, organizing, and summarizing notes.", detailDesc: "Great for building task workflows from brainstorming to checklists. AI features available through a freemium subscription model.", pricingType: "freemium", rating: 4.6, major: ["All"] },
  { id: 9, name: "Elicit", category: "Academic", iconKey: "book", url: "elicit.com", desc: "Automate literature reviews and extract data from scientific papers.", detailDesc: "Quickly summarizes and extracts findings from papers for literature review drafts. Free plan available with usage limits.", pricingType: "freemium", rating: 4.3, major: ["All"] },
];

export const mockSubTasks = [
  {
    id: 1, title: "Find a Topic", status: "done", estimate: "1–2 days", category: "Research",
    description: "The first and most crucial step is finding a topic. Your chosen topic should align with your Computer Science major and have clear novelty. Make sure the topic can be answered with research you can accomplish within the thesis timeline.",
    tips: "Use Perplexity AI for quick research: ask for 5 recent thesis topics, then follow up with the prompt 'include research gaps and at least 3 sources from 2022-2026' to sharpen your topic.",
    toolIds: [1, 3, 7],
  },
  {
    id: 2, title: "Find Related References or Journals", status: "next", estimate: "3–5 days", category: "Academic",
    description: "After determining your topic, you need to collect at least 20–30 references from indexed scientific journals (Scopus, IEEE, ACM). Prioritize journals published within the last 5 years to ensure relevance and recency.",
    tips: "In Scite.ai, use the Smart Citations feature to check whether a paper is 'supporting' or 'contrasting', then prioritize the most frequently supported references for your theoretical foundation.",
    toolIds: [1, 3, 9],
  },
  {
    id: 3, title: "Write a Draft", status: "next", estimate: "2–4 weeks", category: "Writing",
    description: "Start with an outline before writing the full draft. Focus on Chapter I (Introduction) and Chapter II (Literature Review) first. Don't aim for perfection at this stage — the key is to get your ideas flowing.",
    tips: "Use Notion AI to structure your chapter outline, then check sentence clarity with Grammarly so your draft stays academic, coherent, and free of repetition from the start.",
    toolIds: [5, 6, 2],
  },
  {
    id: 4, title: "Paraphrase", status: "next", estimate: "3–5 days", category: "Writing",
    description: "After the draft is complete, make sure every sentence sourced from references is properly paraphrased to avoid plagiarism detection. Paraphrasing isn't just replacing words — it's conveying the idea in a different sentence structure.",
    tips: "Use QuillBot in Formal mode for sentence structure variations, then manually revise to keep technical terms accurate. Avoid raw copy-paste to maintain a consistent writing style.",
    toolIds: [5],
  },
  {
    id: 5, title: "Check Similarity", status: "next", estimate: "1 day", category: "Academic",
    description: "Before submitting to your advisor, you must check similarity using Turnitin or similar tools. The target similarity percentage for Computer Science theses is generally below 20%. If higher, identify the flagged sections and re-paraphrase.",
    tips: "Screen first with Copyleaks/PlagScan for initial checks, then do the final validation on your university's Turnitin account. Focus on fixing long red text blocks and messy citations.",
    toolIds: [3],
  },
];

export const mockSavedTools = [
  { id: 1, name: "Perplexity AI", url: "perplexity.ai", priority: "High Priority", priorityKey: "high", pricingType: "freemium", category: "Research", keywords: ["literature review", "verified sources", "quick research", "academic search", "AI search"], savedAt: "3 Apr 2026", note: "Used for thesis chapter 2" },
  { id: 7, name: "Consensus", url: "consensus.app", priority: "Great Tool", priorityKey: "good", pricingType: "free", category: "Research", keywords: ["journal", "paper", "consensus", "evidence"], savedAt: "2 Apr 2026", note: "Free academic research engine with citations" },
  { id: 2, name: "Scite.ai", url: "scite.ai", priority: "Very Good", priorityKey: "good", pricingType: "freemium", category: "Academic", keywords: ["journal", "citation", "peer review", "reference", "paper"], savedAt: "3 Apr 2026", note: "More contextual alternative to Google Scholar" },
  { id: 3, name: "Notion AI", url: "notion.so", priority: "High Priority", priorityKey: "high", pricingType: "freemium", category: "Productivity", keywords: ["notes", "outline", "workspace", "template", "organize"], savedAt: "1 Apr 2026", note: "For thesis Chapter I template" },
  { id: 4, name: "GitHub Copilot", url: "github.com/copilot", priority: "High Priority", priorityKey: "high", pricingType: "paid", category: "Coding", keywords: ["coding", "autocomplete", "debug", "python", "javascript"], savedAt: "28 Mar 2026", note: "Essential for lab work" },
  { id: 5, name: "Grammarly", url: "grammarly.com", priority: "Very Good", priorityKey: "good", pricingType: "freemium", category: "Writing", keywords: ["grammar", "paraphrase", "writing", "english", "editing"], savedAt: "25 Mar 2026", note: "For proofreading English writing" },
  { id: 6, name: "Julius AI", url: "julius.ai", priority: "Try Later", priorityKey: "later", pricingType: "freemium", category: "Data", keywords: ["data analysis", "visualization", "spreadsheet", "chart", "statistics"], savedAt: "20 Mar 2026", note: "Want to try for thesis data analysis" },
];

export const historyTasks = [
  { id: 1, title: "Help me write my thesis", subtaskCount: 5, date: "5 Apr 2026", isActive: true },
  { id: 2, title: "How to learn coding from scratch", subtaskCount: 4, date: "3 Apr 2026" },
  { id: 3, title: "Teach me Olympiad calculus", subtaskCount: 6, date: "1 Apr 2026" },
  { id: 4, title: "Resume review for internship", subtaskCount: 3, date: "28 Mar 2026" },
  { id: 5, title: "Analyze constitutional law journal", subtaskCount: 5, date: "25 Mar 2026" },
];
