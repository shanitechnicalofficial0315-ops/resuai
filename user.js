// =========================================================================
// SECURITY WARNING: Hardcoding API keys on the client-side frontend is a 
// critical security threat. Anyone loading the page can view this key 
// by inspecting the script files, exposing it to malicious usage and theft.
//
// For local development, enter your key below or use the Admin panel.
// In production, configure a backend proxy or serverless function to execute
// requests securely without exposing credentials to client browsers.
// =========================================================================
const API_KEY = "YOUR_API_KEY_HERE";

// Default configuration settings (matching admin.js)
const DEFAULTS = {
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    apiKey: "",
    resumePrompt: "Write a professional, impact-driven {{TONE}} resume summary for a target role of {{JOB_TITLE}} written in {{LANGUAGE}} language. Core skills to highlight: {{SKILLS}}. Detail experiences: {{EXPERIENCE}}. Keep it in the third-person, professional, and action-oriented.",
    coverLetter: "Write a professional, tailored, {{TONE}} cover letter for the role of {{JOB_TITLE}} written in {{LANGUAGE}} language. Use the following experiences and skills: {{SKILLS}}. Experience context: {{EXPERIENCE}}. The letter must follow standard formatting conventions, span approximately 3 to 4 paragraphs, and feel authentic.",
    modernStyle: "",
    classicStyle: "",
    minimalStyle: ""
};

// Storage Keys matching admin.js
const STORAGE_KEYS = {
    endpoint: "resuai_api_endpoint",
    model: "resuai_api_model",
    apiKey: "resuai_api_key",
    resumePrompt: "resuai_prompt_resume",
    coverLetter: "resuai_prompt_cover",
    cssModern: "resuai_css_modern",
    cssClassic: "resuai_css_classic",
    cssMinimal: "resuai_css_minimal",
    theme: "resuai_theme_preference"
};

// Bilingual UI Label Dictionary
const TRANSLATIONS = {
    English: {
        logoTitle: "ResuAI",
        welcomeText: "Elevate Your Career Application",
        welcomeTagline: "Generate highly professional, AI-powered resume summaries and cover letters tailored to your target roles.",
        formHeading: "Application Details",
        labelJobTitle: "Target Job Title",
        labelSkills: "Key Skills & Proficiencies",
        labelExperience: "Detailed Work Experience",
        labelDocType: "Output Document Type",
        optionResumeSummary: "Resume Summary",
        optionCoverLetter: "Cover Letter",
        labelTone: "Document Tone",
        optionToneProfessional: "Professional",
        optionToneFriendly: "Friendly",
        optionToneFormal: "Formal",
        labelLanguage: "Output Language",
        labelTemplate: "Output Style Template",
        optionTemplateModern: "Modern Style",
        optionTemplateClassic: "Classic Style",
        optionTemplateMinimal: "Minimal Style",
        btnGenerate: "Generate with AI",
        btnGenerating: "Crafting document...",
        scoreTitle: "Resume Strength Score",
        scoreFeedbackDefault: "Fill out the fields on the left to analyze your resume inputs.",
        outputHeading: "AI Generated Output",
        placeholderTitle: "Ready for Generation",
        placeholderText: "Fill out the target details and click \"Generate with AI\" to create your tailored document.",
        btnCopy: "Copy",
        btnCopied: "Copied!",
        btnDownloadPdf: "Download as PDF",
        btnDownloadWord: "Download as Word"
    },
    Urdu: {
        logoTitle: "ریزو اے آئی (ResuAI)",
        welcomeText: "اپنے کیریئر کی درخواست کو بہتر بنائیں",
        welcomeTagline: "اپنے مطلوبہ کرداروں کے مطابق انتہائی پیشہ ورانہ، AI سے چلنے والے سی وی کے خلاصے اور کور لیٹر فوراً تیار کریں۔",
        formHeading: "درخواست کی تفصیلات",
        labelJobTitle: "ہدف نوکری کا عنوان (Job Title)",
        labelSkills: "اہم مہارتیں اور قابلیتیں (Skills)",
        labelExperience: "تفصیلی تجربہ (Work Experience)",
        labelDocType: "دستاویز کی قسم (Document Type)",
        optionResumeSummary: "سی وی کا خلاصہ (Resume Summary)",
        optionCoverLetter: "کور لیٹر (Cover Letter)",
        labelTone: "دستاویز کا لہجہ (Tone)",
        optionToneProfessional: "پیشہ ورانہ (Professional)",
        optionToneFriendly: "دوستانہ (Friendly)",
        optionToneFormal: "رسمی (Formal)",
        labelLanguage: "دستاویز کی زبان (Language)",
        labelTemplate: "ٹیمپلیٹ کا انداز (Template)",
        optionTemplateModern: "جدید انداز (Modern)",
        optionTemplateClassic: "کلاسیکی انداز (Classic)",
        optionTemplateMinimal: "سادہ انداز (Minimal)",
        btnGenerate: "مصنوعی ذہانت سے تیار کریں",
        btnGenerating: "...تیار کیا جا رہا ہے",
        scoreTitle: "سی وی کی طاقت کا سکور (Resume Score)",
        scoreFeedbackDefault: "اپنے سی وی کے مواد کا تجزیہ کرنے کے لیے بائیں جانب فارم پُر کریں۔",
        outputHeading: "اے آئی کا تیار کردہ مواد",
        placeholderTitle: "تیاری کے لیے تیار ہے",
        placeholderText: "تفصیلات پُر کریں اور اپنی مرضی کے مطابق دستاویز بنانے کے لیے \"مصنوعی ذہانت سے تیار کریں\" پر کلک کریں۔",
        btnCopy: "کاپی کریں",
        btnCopied: "کاپی ہو گیا!",
        btnDownloadPdf: "پی ڈی ایف ڈاؤن لوڈ کریں",
        btnDownloadWord: "ورڈ فائل ڈاؤن لوڈ کریں"
    }
};

// DOM Elements
const bodyElement = document.body;
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");

const textLogoTitle = document.getElementById("textLogoTitle");
const textWelcomeText = document.getElementById("textWelcomeText");
const textWelcomeTagline = document.getElementById("textWelcomeTagline");
const textFormHeading = document.getElementById("textFormHeading");
const textLabelJobTitle = document.getElementById("textLabelJobTitle");
const textLabelSkills = document.getElementById("textLabelSkills");
const textLabelExperience = document.getElementById("textLabelExperience");
const textLabelDocType = document.getElementById("textLabelDocType");
const textLabelTone = document.getElementById("textLabelTone");
const textLabelLanguage = document.getElementById("textLabelLanguage");
const textLabelTemplate = document.getElementById("textLabelTemplate");

const optionResumeSummary = document.getElementById("optionResumeSummary");
const optionCoverLetter = document.getElementById("optionCoverLetter");
const optionToneProfessional = document.getElementById("optionToneProfessional");
const optionToneFriendly = document.getElementById("optionToneFriendly");
const optionToneFormal = document.getElementById("optionToneFormal");
const optionTemplateModern = document.getElementById("optionTemplateModern");
const optionTemplateClassic = document.getElementById("optionTemplateClassic");
const optionTemplateMinimal = document.getElementById("optionTemplateMinimal");

const jobTitleInput = document.getElementById("jobTitle");
const skillsInput = document.getElementById("skills");
const experienceInput = document.getElementById("experience");
const typeSelect = document.getElementById("type");
const toneSelect = document.getElementById("tone");
const languageSelect = document.getElementById("language");
const templateSelect = document.getElementById("template");
const btnGenerate = document.getElementById("btnGenerate");

const scoreTitle = document.getElementById("scoreTitle");
const scoreBadge = document.getElementById("scoreBadge");
const scoreNumber = document.getElementById("scoreNumber");
const scoreFeedbackHeader = document.getElementById("scoreFeedbackHeader");
const scoreFeedbackText = document.getElementById("scoreFeedbackText");

const outputHeading = document.getElementById("outputHeading");
const placeholderArea = document.getElementById("placeholderArea");
const loaderArea = document.getElementById("loaderArea");
const outputContent = document.getElementById("outputContent");
const btnCopy = document.getElementById("btnCopy");
const copyBtnText = document.getElementById("copyBtnText");
const copyIcon = document.getElementById("copyIcon");
const downloadGroup = document.getElementById("downloadGroup");
const btnDownloadPdf = document.getElementById("btnDownloadPdf");
const btnDownloadWord = document.getElementById("btnDownloadWord");

const toastContainer = document.getElementById("toastContainer");

// On Load Initialization
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initUserGreeting();      // Show logged-in user's name in header
    injectAds();             // Inject admin-configured ad slots
    applyTemplateStyle();    // Load dynamic custom stylesheets if configured
    setupEventListeners();
    runScoreChecker();       // Initial scoring check
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || "dark";
    if (savedTheme === "light") {
        bodyElement.classList.add("light-theme");
        updateThemeIcon(true);
    } else {
        bodyElement.classList.remove("light-theme");
        updateThemeIcon(false);
    }
}

// Show logged-in user's name and avatar initial in the header
function initUserGreeting() {
    // getCurrentUser() is defined in auth.js (loaded before user.js)
    const user = getCurrentUser();
    if (!user) return; // requireAuth() would have already redirected
    const greeting = document.getElementById("userGreeting");
    const avatar   = document.getElementById("userAvatar");
    if (greeting) greeting.textContent = user.name.split(" ")[0]; // First name only
    if (avatar)   avatar.textContent   = user.name.charAt(0).toUpperCase();
}

// Inject ad HTML from admin configuration into the designated ad slots
function injectAds() {
    let config = {};
    try { config = JSON.parse(localStorage.getItem("resuai_ad_config")) || {}; } catch {}

    const slots = [
        { id: "adSlotHeader",      code: config.headerCode,      enabled: config.headerEnabled },
        { id: "adSlotSidebar",     code: config.sidebarCode,     enabled: config.sidebarEnabled },
        { id: "adSlotBelowOutput", code: config.belowOutputCode, enabled: config.belowOutputEnabled }
    ];

    slots.forEach(({ id, code, enabled }) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (enabled && code && code.trim()) {
            // Use innerHTML — admin is trusted; do NOT do this with untrusted user input
            el.innerHTML = code;
            // Re-execute any <script> tags (innerHTML doesn't run scripts)
            el.querySelectorAll("script").forEach(oldScript => {
                const newScript = document.createElement("script");
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });
        } else {
            el.innerHTML = "";
        }
    });
}

function toggleTheme() {
    const isLight = bodyElement.classList.toggle("light-theme");
    localStorage.setItem(STORAGE_KEYS.theme, isLight ? "light" : "dark");
    updateThemeIcon(isLight);
    showToast(`Switched to ${isLight ? 'Light' : 'Dark'} Mode`, "success");
}

function updateThemeIcon(isLight) {
    if (isLight) {
        themeIcon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
        themeToggleBtn.title = "Switch to Dark Mode";
    } else {
        themeIcon.innerHTML = `
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
        themeToggleBtn.title = "Switch to Light Mode";
    }
}

// Retrieve configurations from storage
function getSettings() {
    return {
        endpoint: localStorage.getItem(STORAGE_KEYS.endpoint) || DEFAULTS.endpoint,
        model: localStorage.getItem(STORAGE_KEYS.model) || DEFAULTS.model,
        apiKey: localStorage.getItem(STORAGE_KEYS.apiKey) || API_KEY,
        resumePrompt: localStorage.getItem(STORAGE_KEYS.resumePrompt) || DEFAULTS.resumePrompt,
        coverLetter: localStorage.getItem(STORAGE_KEYS.coverLetter) || DEFAULTS.coverLetter,
        cssModern: localStorage.getItem(STORAGE_KEYS.cssModern) || "",
        cssClassic: localStorage.getItem(STORAGE_KEYS.cssClassic) || "",
        cssMinimal: localStorage.getItem(STORAGE_KEYS.cssMinimal) || ""
    };
}

// Set listeners
function setupEventListeners() {
    themeToggleBtn.addEventListener("click", toggleTheme);
    languageSelect.addEventListener("change", handleLanguageChange);
    templateSelect.addEventListener("change", applyTemplateStyle);
    btnGenerate.addEventListener("click", handleGeneration);
    btnCopy.addEventListener("click", copyOutputText);
    btnDownloadPdf.addEventListener("click", downloadAsPdf);
    btnDownloadWord.addEventListener("click", downloadAsWord);

    // Live score inputs change listener
    jobTitleInput.addEventListener("input", runScoreChecker);
    skillsInput.addEventListener("input", runScoreChecker);
    experienceInput.addEventListener("input", runScoreChecker);
}

// Dynamic Template Styles Injector
function applyTemplateStyle() {
    const selectedTemplate = templateSelect.value;
    const settings = getSettings();
    
    // Reset stylesheet classes
    outputContent.className = "";
    outputContent.classList.add(`template-${selectedTemplate}`);

    // Dynamic external CSS Injection for custom themes
    let dynamicLink = document.getElementById("dynamic-template-css");
    let targetCSSUrl = "";

    if (selectedTemplate === "modern" && settings.cssModern) targetCSSUrl = settings.cssModern;
    else if (selectedTemplate === "classic" && settings.cssClassic) targetCSSUrl = settings.cssClassic;
    else if (selectedTemplate === "minimal" && settings.cssMinimal) targetCSSUrl = settings.cssMinimal;

    if (targetCSSUrl) {
        if (!dynamicLink) {
            dynamicLink = document.createElement("link");
            dynamicLink.id = "dynamic-template-css";
            dynamicLink.rel = "stylesheet";
            document.head.appendChild(dynamicLink);
        }
        dynamicLink.href = targetCSSUrl;
    } else {
        if (dynamicLink) {
            dynamicLink.remove();
        }
    }
}

// UI Multilingual Translation handler
function handleLanguageChange() {
    const lang = languageSelect.value;
    const translation = TRANSLATIONS[lang];

    // Flip HTML Direction for Urdu
    if (lang === "Urdu") {
        document.documentElement.dir = "rtl";
        bodyElement.style.textAlign = "right";
    } else {
        document.documentElement.dir = "ltr";
        bodyElement.style.textAlign = "left";
    }

    // Translate DOM Text Nodes
    textLogoTitle.textContent = translation.logoTitle;
    textWelcomeText.textContent = translation.welcomeText;
    textWelcomeTagline.textContent = translation.welcomeTagline;
    textFormHeading.textContent = translation.formHeading;
    textLabelJobTitle.textContent = translation.labelJobTitle;
    textLabelSkills.textContent = translation.labelSkills;
    textLabelExperience.textContent = translation.labelExperience;
    textLabelDocType.textContent = translation.labelDocType;
    textLabelTone.textContent = translation.labelTone;
    textLabelLanguage.textContent = translation.labelLanguage;
    textLabelTemplate.textContent = translation.labelTemplate;

    optionResumeSummary.textContent = translation.optionResumeSummary;
    optionCoverLetter.textContent = translation.optionCoverLetter;
    optionToneProfessional.textContent = translation.optionToneProfessional;
    optionToneFriendly.textContent = translation.optionToneFriendly;
    optionToneFormal.textContent = translation.optionToneFormal;
    optionTemplateModern.textContent = translation.optionTemplateModern;
    optionTemplateClassic.textContent = translation.optionTemplateClassic;
    optionTemplateMinimal.textContent = translation.optionTemplateMinimal;

    // Placeholders
    jobTitleInput.placeholder = lang === "Urdu" ? "جیسے: سینئر ویب ڈویلپر" : "e.g. Senior Frontend Engineer";
    skillsInput.placeholder = lang === "Urdu" ? "جیسے: ایچ ٹی ایم ایل، سی ایس ایس، جاوا اسکرپٹ" : "e.g. React, TypeScript, Node.js";
    experienceInput.placeholder = lang === "Urdu" ? "تفصیلی کردار، ذمہ داریاں اور کامیابیاں..." : "E.g. Led a team of 4 engineers to deliver a new SaaS dashboard, reducing page load latency by 40%...";

    // Button states
    if (btnGenerate.disabled) {
        btnGenerate.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; display: inline-block; margin-right: 4px;"></span> ${translation.btnGenerating}`;
    } else {
        btnGenerate.textContent = translation.btnGenerate;
    }
    
    scoreTitle.textContent = translation.scoreTitle;
    outputHeading.textContent = translation.outputHeading;
    
    // Copy/Download texts
    copyBtnText.textContent = translation.btnCopy;
    btnDownloadPdf.textContent = translation.btnDownloadPdf;
    btnDownloadWord.textContent = translation.btnDownloadWord;

    // Dynamic placeholder content translation
    if (placeholderArea.style.display !== "none") {
        placeholderArea.querySelector("h3").textContent = translation.placeholderTitle;
        placeholderArea.querySelector("p").textContent = translation.placeholderText;
    }

    // Refresh score metrics text
    runScoreChecker();
}

// Resume Score Checker Engine
function runScoreChecker() {
    const jobTitle = jobTitleInput.value.trim();
    const skills = skillsInput.value.trim();
    const experience = experienceInput.value.trim();
    const lang = languageSelect.value;

    let score = 0;
    let tips = [];

    // Criteria 1: Job Title present
    if (jobTitle.length > 2) {
        score += 15;
    } else {
        tips.push(lang === "Urdu" ? "نوکری کا عنوان لکھیں" : "Add a target job title.");
    }

    // Criteria 2: Key Skills volume
    const skillList = skills.split(",").map(s => s.trim()).filter(s => s.length > 0);
    if (skillList.length >= 5) {
        score += 25;
    } else if (skillList.length >= 3) {
        score += 15;
        tips.push(lang === "Urdu" ? "کم از کم 5 مہارتیں درج کریں" : "List at least 5 key skills.");
    } else if (skillList.length >= 1) {
        score += 5;
        tips.push(lang === "Urdu" ? "مزید تکنیکی مہارتیں درج کریں" : "Add more specific technical skills.");
    } else {
        tips.push(lang === "Urdu" ? "اپنی مہارتیں درج کریں" : "List your professional skills.");
    }

    // Criteria 3: Experience description volume
    if (experience.length >= 250) {
        score += 25;
    } else if (experience.length >= 100) {
        score += 15;
        tips.push(lang === "Urdu" ? "کام کے تجربے کی مزید تفصیل لکھیں" : "Elaborate more on your work achievements.");
    } else if (experience.length > 10) {
        score += 5;
        tips.push(lang === "Urdu" ? "تجربے کا تفصیلی خلاصہ لکھیں" : "Write a detailed experience summary.");
    } else {
        tips.push(lang === "Urdu" ? "تفصیلی تجربہ لکھیں" : "Provide detailed work experiences.");
    }

    // Criteria 4: Check for Action Verbs (English only)
    const actionVerbs = ["led", "managed", "developed", "designed", "created", "spearheaded", "implemented", "built", "optimized", "increased", "solved", "analyzed", "delivered", "engineered", "streamlined", "overhauled"];
    let verbCount = 0;
    const lowerExp = experience.toLowerCase();
    actionVerbs.forEach(verb => {
        const regex = new RegExp(`\\b${verb}\\b`, 'g');
        const matches = lowerExp.match(regex);
        if (matches) verbCount += matches.length;
    });

    if (verbCount >= 3) {
        score += 20;
    } else if (verbCount >= 1) {
        score += 10;
        tips.push(lang === "Urdu" ? "مزید ایکشن الفاظ استعمال کریں (جیسے: ڈیزائن کیا، منظم کیا)" : "Use more impact-driven action verbs (e.g., spearheaded, optimized).");
    } else {
        if (lang === "English" && experience.length > 0) {
            tips.push("Start experience bullet points with strong action verbs.");
        }
    }

    // Criteria 5: Quantifiable Metrics (contains numbers or %)
    const hasMetrics = /[\d%]/g.test(experience);
    if (hasMetrics) {
        score += 15;
    } else {
        if (experience.length > 0) {
            tips.push(lang === "Urdu" ? "کامیابیوں کو نمبرز یا فیصد میں ظاہر کریں" : "Include quantifiable metrics (e.g., increased efficiency by 25%).");
        }
    }

    // Update UI Badge
    scoreNumber.textContent = score;
    scoreBadge.className = "score-badge-circle"; // Reset
    
    if (score < 40) {
        scoreBadge.classList.add("low");
        scoreFeedbackHeader.textContent = lang === "Urdu" ? "کمزور کارکردگی" : "Needs Improvement";
    } else if (score < 75) {
        scoreBadge.classList.add("med");
        scoreFeedbackHeader.textContent = lang === "Urdu" ? "مناسب آغاز" : "Good Progress";
    } else {
        scoreBadge.classList.add("high");
        scoreFeedbackHeader.textContent = lang === "Urdu" ? "بہترین معیار" : "Excellent Profile";
    }

    // Display first 2 tips
    if (tips.length > 0) {
        scoreFeedbackText.innerHTML = tips.slice(0, 2).map(tip => `• ${tip}`).join("<br>");
    } else {
        scoreFeedbackText.textContent = lang === "Urdu" ? "آپ کا سی وی مواد بہترین حالت میں ہے!" : "Your profile inputs look extremely solid!";
    }
}

// AI Content Generation Trigger
async function handleGeneration() {
    const jobTitle = jobTitleInput.value.trim();
    const skills = skillsInput.value.trim();
    const experience = experienceInput.value.trim();
    const docType = typeSelect.value;
    const tone = toneSelect.value;
    const lang = languageSelect.value;

    const translation = TRANSLATIONS[lang];

    if (!jobTitle || !skills) {
        showToast(lang === "Urdu" ? "براہ کرم تمام لازمی فیلڈز پُر کریں!" : "Please fill out all mandatory fields.", "error");
        return;
    }

    const settings = getSettings();
    const activeKey = settings.apiKey;

    // Check if key exists
    if (!activeKey || activeKey === "YOUR_API_KEY_HERE") {
        showToast(lang === "Urdu" ? "پہلے ایڈمن پینل پر جا کر اپنی API کی درج کریں!" : "Please go to the Admin Panel and configure your API Key first.", "error");
        return;
    }

    // UI State: Loading
    placeholderArea.style.display = "none";
    outputContent.style.display = "none";
    btnCopy.style.display = "none";
    downloadGroup.style.display = "none";
    loaderArea.style.display = "flex";
    btnGenerate.disabled = true;
    btnGenerate.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; display: inline-block; margin-right: 4px;"></span> ${translation.btnGenerating}`;

    // Prompts Selecting
    let baseTemplate = docType === "coverLetter" ? settings.coverLetter : settings.resumePrompt;
    
    // Placeholder Interpolation
    let prompt = baseTemplate
        .replace(/\{\{JOB_TITLE\}\}/g, jobTitle)
        .replace(/\{\{SKILLS\}\}/g, skills)
        .replace(/\{\{TONE\}\}/g, tone)
        .replace(/\{\{LANGUAGE\}\}/g, lang)
        .replace(/\{\{EXPERIENCE\}\}/g, experience || "Not specified");

    // Enforce Language Instruction
    if (lang === "Urdu") {
        prompt += "\nIMPORTANT: The output must be written entirely in beautiful Urdu script (اردو رسم الخط). Do not output English translations.";
    }

    try {
        const response = await fetch(settings.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${activeKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    {
                        role: "system",
                        content: `You are an elite career strategist. Write professional documents in ${lang} language using a ${tone} tone.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData?.error?.message || `HTTP ${response.status}`;
            throw new Error(errMsg);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const aiText = data.choices[0].message.content.trim();
            
            outputContent.textContent = aiText;
            outputContent.style.display = "block";
            btnCopy.style.display = "flex";
            downloadGroup.style.display = "flex";
            // Track this generation for analytics
            if (typeof trackGeneration === "function") trackGeneration();
            showToast(lang === "Urdu" ? "دستاویز تیار ہو گئی ہے!" : "Document generated successfully!", "success");
        } else {
            throw new Error("Unexpected schema returned from the API.");
        }

    } catch (err) {
        console.error("API Call Failed:", err);
        outputContent.textContent = `Error: ${err.message}\n\nPlease verify your API settings in the Admin panel. Make sure your Endpoint URL, Model, and API Key are valid.`;
        outputContent.style.display = "block";
        showToast(lang === "Urdu" ? "تیاری ناکام ہو گئی۔ ایڈمن ترتیبات چیک کریں۔" : "Generation failed. Verify Admin credentials/keys.", "error");
    } finally {
        // UI Reset
        loaderArea.style.display = "none";
        btnGenerate.disabled = false;
        btnGenerate.textContent = translation.btnGenerate;
    }
}

// Copy to Clipboard
async function copyOutputText() {
    const text = outputContent.textContent;
    if (!text) return;

    const lang = languageSelect.value;
    const translation = TRANSLATIONS[lang];

    try {
        await navigator.clipboard.writeText(text);
        
        // Success animation states
        copyBtnText.textContent = translation.btnCopied;
        btnCopy.style.borderColor = "var(--text-success)";
        btnCopy.style.color = "var(--text-success)";
        
        const originalIcon = copyIcon.innerHTML;
        copyIcon.innerHTML = `<polyline points="20 6 9 17 4 12"></polyline>`;
        
        showToast(lang === "Urdu" ? "کاپی ہو گیا!" : "Copied to clipboard!", "success");

        setTimeout(() => {
            copyBtnText.textContent = translation.btnCopy;
            btnCopy.style.borderColor = "";
            btnCopy.style.color = "";
            copyIcon.innerHTML = originalIcon;
        }, 2000);

    } catch (err) {
        console.error(err);
        showToast("Copy failed.", "error");
    }
}

// Exporter: PDF Download using jsPDF
function downloadAsPdf() {
    const text = outputContent.textContent;
    const docType = typeSelect.value;
    const lang = languageSelect.value;

    if (!text) return;

    try {
        const { jsPDF } = window.jspdf;
        // Standard Letter format
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "letter"
        });

        const margin = 40;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - (margin * 2);

        // Note: Standard jsPDF Helvetia font does not support Urdu unicode scripts.
        // We warn the user if exporting Urdu, but proceed with standard output or layout.
        if (lang === "Urdu") {
            showToast("PDF Unicode font limits: non-English text formatting may require custom language packs.", "error");
        }

        // Header Styling
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(37, 99, 235); // Blue Accent
        
        const headerText = docType === "coverLetter" ? "Generated Cover Letter" : "Professional Resume Summary";
        doc.text(headerText, margin, 50);

        // Underline bar
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(1.5);
        doc.line(margin, 60, margin + 180, 60);

        // Body Styling
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42); // Dark slate

        // Split text to fit columns width
        const lines = doc.splitTextToSize(text, contentWidth);
        
        let cursorY = 90;
        const lineHeight = 16;

        lines.forEach(line => {
            if (cursorY + lineHeight > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
            }
            doc.text(line, margin, cursorY);
            cursorY += lineHeight;
        });

        doc.save(`${docType}_ResuAI.pdf`);
        showToast("PDF downloaded successfully!", "success");

    } catch (err) {
        console.error("PDF Export Failed:", err);
        showToast("Failed to compile PDF. Check libraries link.", "error");
    }
}

// Exporter: MS Word Document Binary Export
function downloadAsWord() {
    const text = outputContent.textContent;
    const docType = typeSelect.value;

    if (!text) return;

    try {
        // Formatting paragraphs using basic MS Word HTML blob syntax.
        // Highly compatible, respects newlines, margins, and unicode (Urdu characters support).
        const paragraphs = text.split("\n").map(para => {
            const cleanPara = para.trim();
            if (!cleanPara) return "";
            return `<p style="margin-bottom: 12px; text-align: justify; font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b;">${cleanPara}</p>`;
        }).join("");

        const wordTemplate = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>Exported Document</title>
                <!--[if gte mso 9]>
                <xml>
                    <w:WordDocument>
                        <w:View>Print</w:View>
                        <w:Zoom>90</w:Zoom>
                    </w:WordDocument>
                </xml>
                <![endif]-->
                <style>
                    @page WordSection1 {
                        size: 8.5in 11.0in;
                        margin: 1.0in 1.0in 1.0in 1.0in;
                        mso-header-margin: .5in;
                        mso-footer-margin: .5in;
                        mso-paper-source: 0;
                    }
                    div.WordSection1 {
                        page: WordSection1;
                    }
                </style>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <div class="WordSection1">
                    <h2 style="font-family: 'Arial', sans-serif; font-size: 16pt; color: #2563eb; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                        ${docType === "coverLetter" ? "Cover Letter" : "Professional Resume Summary"}
                    </h2>
                    ${paragraphs}
                </div>
            </body>
            </html>
        `;

        // Prepend BOM to force UTF-8 representation (critical for Urdu characters to show in MS Word)
        const blob = new Blob(["\ufeff" + wordTemplate], {
            type: "application/msword;charset=utf-8"
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${docType}_ResuAI.doc`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        showToast("Word document downloaded successfully!", "success");

    } catch (err) {
        console.error("Word Export Failed:", err);
        showToast("Failed to compile Word document.", "error");
    }
}

// Toast Notifications Manager
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconSvg = "";
    if (type === "success") {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-success);"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-danger);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
