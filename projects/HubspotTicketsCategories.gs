function classifyTAMTickets() {
  const hub  = new Hub.Spot();
  const chat = new OpenAI.Chat();

  // Your TAM pipeline ID
  const TAM_PIPELINE_ID = "12344556";

  // Flip to true to write back to HubSpot
  const WRITE_BACK = false;

  // Keep prompts reasonable
  const MAX_CONTENT_CHARS = 4000;

  // Allowed categories (exact spellings)
  const CATEGORIES = [
    "Onboarding Builds",
    "Career Site",
    "API or Integrations", //TODO: Add more categories here
    "Other"
  ];

  const tickets = hub.getTicketsInPipeline(TAM_PIPELINE_ID);
  Logger.log(`Found ${tickets.length} tickets in TAM pipeline.`);

  tickets.forEach(function(t, idx) {
    try {
      const p = t.properties || {};
      const shortDesc = (p.tam_ticket_description || "").trim();
      const fullDesc  = (p.tam_ticket_description___full_email_thread || "").trim();
      const contentRaw = (fullDesc.length > shortDesc.length ? fullDesc : shortDesc) || "";
      const content = truncate(contentRaw, MAX_CONTENT_CHARS);
      const subject = (p.tam_ticket_notes || p.subject || "").trim() || "N/A";

      const ticketBlock = [
        `Ticket ID: ${t.id}`,
        `Subject: ${subject}`,
        `Content: ${content || "N/A"}`
      ].join("\n");

      const messages = [
        { role: "system", content:
          "You classify TAM tickets into exactly one category from a fixed list. " +
          "First, explain your reasoning briefly. Then, on the FINAL line only, " +
          "output the chosen category using the exact marker format: <<<TAM_CATEGORY>>> <Category Name>."
        },
        { role: "user", content: buildReasonedPrompt(ticketBlock, CATEGORIES) }
      ];

      const resp = chat.chat(messages, "gpt-4o-mini");
      const raw = (
        resp && resp.choices && resp.choices[0] &&
        resp.choices[0].message && resp.choices[0].message.content
      ) || "";

      const parsed = parseReasonedCategory(raw, CATEGORIES);
      Logger.log(`#${idx+1}/${tickets.length} Ticket ${t.id}\nReasoning:\n${parsed.reasoning}\nChosen: "${parsed.category}"`);

      if (WRITE_BACK) {
        try {
          hub.updateTicketProperties(t.id, { tam_ticket_category: parsed.category });
          Logger.log(`✅ Updated ticket ${t.id} tam_ticket_category="${parsed.category}"`);
        } catch (e) {
          Logger.log(`❌ Update failed for ${t.id}: ${e}`);
        }
      }

      Utilities.sleep(250); // gentle pacing
    } catch (err) {
      Logger.log(`⚠️ Error classifying ticket ${t && t.id ? t.id : "(unknown)"}: ${err}`);
    }
  });
}

/** Prompt that asks for reasoning + final marker */
function buildReasonedPrompt(ticketBlock, categories) {
  return [
    "Choose exactly ONE category from the allowed list for the ticket below.",
    "",
    "Allowed categories:",
    ...categories.map(c => `- ${c}`),
    "",
    "Category descriptions:",
    "- Onboarding Builds: Creating/editing onboarding or migrating from onboarding v1→v2",
    "- Career Site: Career site work or HTML/CSS/JS changes",
    "- API or Integrations: Pinpoint API, SFTP, Webhooks, or 3rd-party integrations", //TODO: Add your categories here
    "",
    "Instructions:",
    "1) Provide a brief explanation (2–4 sentences max).",
    "2) On the FINAL line ONLY, output the marker followed by the exact category:",
    "   <<<TAM_CATEGORY>>> <Category Name>",
    "   (No extra text after the category name.)",
    "",
    "Ticket:",
    ticketBlock
  ].join("\n");
}

/** Robust parser for reasoning + category marker */
function parseReasonedCategory(text, allowed) {
  const MARKER = "<<<TAM_CATEGORY>>>";
  if (!text) return { reasoning: "", category: "Other" };

  // Strip code fences if present
  const fenced = text.match(/```(?:json|txt)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) text = fenced[1];

  // Find the LAST occurrence of the marker (in case model repeats)
  const pos = text.lastIndexOf(MARKER);
  if (pos === -1) {
    // No marker; treat everything as reasoning, default category
    return { reasoning: text.trim(), category: "Other" };
  }

  const reasoning = text.slice(0, pos).trim();
  const tail = text.slice(pos + MARKER.length).trim();

  // Expect "<Category Name>" after marker; allow optional ":" or "-" before category
  // e.g., "<<<TAM_CATEGORY>>> Technical Debugging"
  //       "<<<TAM_CATEGORY>>>: Technical Debugging"
  let rawCat = tail.replace(/^[:\-]\s*/, ""); // remove starting ":" or "-" if model adds
  rawCat = rawCat.split(/\r?\n/)[0].trim();   // only consider the first line after marker

  const category = normalizeCategory(rawCat, allowed);
  return { reasoning, category };
}

/** Trim to max characters */
function truncate(s, maxChars) {
  if (!s) return s;
  return s.length <= maxChars ? s : s.slice(0, maxChars);
}

/** Validate/normalize model output to allowed set; fallback to 'Other' */
function normalizeCategory(raw, allowed) {
  if (!raw) return "Other";
  if (allowed.indexOf(raw) !== -1) return raw;

  const lc = raw.toLowerCase().trim();
  const exact = allowed.find(a => a.toLowerCase() === lc);
  if (exact) return exact;

  const aliases = {
    "onboarding": "Onboarding Builds",
    "onboarding build": "Onboarding Builds",
    "careers site": "Career Site",
    "career site": "Career Site",
    "api": "API or Integrations",
    "integration": "API or Integrations",
    "integrations": "API or Integrations",
    "bulk": "Bulk Data Changes",
    "bulk data": "Bulk Data Changes",
    "advanced": "Advanced Use Cases",
    "debugging": "Technical Debugging",
    "technical": "Technical Debugging",
    "tech call": "Tech Call Request",
    "call": "Tech Call Request", 
    "reporting": "Reporting", 
    "reports": "Reporting", 
    "insights": "Reporting", 
    "cronofy": "Cronofy", 
    "calendars": "Cronofy", 
    "interviews": "Cronofy", 
  };
  if (aliases[lc]) return aliases[lc];

  return "Other";
}

