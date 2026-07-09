window.__HARNESS__ = {
    "name":  "Kurama-Harness",
    "version":  "1.4",
    "subtitle":  "Constitutional Chakra",
    "author":  "Sarit M (Worley)",
    "summary":  "Model-agnostic system-prompt + capability harness: locked chakra-core + nine toggleable tails, bound to any host LLM by an adapter, composed by compose.py. The TriFable MiniVerse is its experiential front-end.",
    "chakraCore":  [
                       "core-00-identity",
                       "core-01-safety",
                       "core-02-copyright",
                       "core-03-wellbeing"
                   ],
    "tails":  [
                  {
                      "id":  "tail-1-conduct-voice",
                      "name":  "Conduct Voice"
                  },
                  {
                      "id":  "tail-2-boundaries",
                      "name":  "Boundaries"
                  },
                  {
                      "id":  "tail-3-knowledge-retrieval",
                      "name":  "Knowledge Retrieval"
                  },
                  {
                      "id":  "tail-4-tools",
                      "name":  "Tools"
                  },
                  {
                      "id":  "tail-5-computer-files",
                      "name":  "Computer Files"
                  },
                  {
                      "id":  "tail-6-artifacts-persistence",
                      "name":  "Artifacts Persistence"
                  },
                  {
                      "id":  "tail-7-memory-context",
                      "name":  "Memory Context"
                  },
                  {
                      "id":  "tail-8-integrations",
                      "name":  "Integrations"
                  },
                  {
                      "id":  "tail-9-citation",
                      "name":  "Citation"
                  }
              ],
    "defaultTails":  [
                         1,
                         2,
                         3,
                         4,
                         5,
                         6,
                         8,
                         9
                     ],
    "adapters":  [
                     "claude",
                     "gemini",
                     "grok",
                     "kimi",
                     "kurama",
                     "llama",
                     "minimax",
                     "mistral",
                     "openai-gpt",
                     "qwen",
                     "sarvam"
                 ],
    "skills":  {
                   "engineering":  {
                                       "count":  25,
                                       "ids":  [
                                                   "qa",
                                                   "skill-lab",
                                                   "alaska-lng-fabrication-atlas",
                                                   "autoresearcher-console",
                                                   "axisforge-epc-os",
                                                   "comprehensive-estimate",
                                                   "fabsim-living-city",
                                                   "feed-engineering-docs",
                                                   "feed-report",
                                                   "feed-study-prompt-generator",
                                                   "forgeone-calc-engine",
                                                   "forgeone-pdf-engine",
                                                   "genanalyze-galaxy",
                                                   "geoforge-geospatial",
                                                   "lng-digital-twin-3d",
                                                   "loki-godseye-dashboard",
                                                   "pdie-procurement-intelligence",
                                                   "production-3d-ecp",
                                                   "tbe-analysis-generator",
                                                   "worley-pbi-platform",
                                                   "worleyverse-epcm-engine",
                                                   "worleyverse-platform-harnesses",
                                                   "skill-optimizer",
                                                   "momento-marker",
                                                   "momento-oblivion"
                                               ]
                                   },
                   "badminton":  {
                                     "count":  6,
                                     "ids":  [
                                                 "coach-sensei-vision",
                                                 "kinetic-chain-biomechanics",
                                                 "senseiforge-orchestration",
                                                 "shuttle-trajectory-simulator",
                                                 "smash-ai-tactical",
                                                 "flex4d-human-reconstruction"
                                             ]
                                 }
               },
    "integrations":  [
                         "skillopt (skill optimizer, MIT)",
                         "helixdb (graph-vector memory/RAG, AGPL ext)",
                         "flex4d-human-reconstruction",
                         "momento-marker (9-tailed memory)",
                         "momento-oblivion (right to erase)",
                         "constitutional-chakra (CONSTITUTION + governance)"
                     ],
    "avatarMapping":  [
                          {
                              "courier":  "kuro",
                              "tail":  "ALL (1-9)",
                              "adapter":  "kurama",
                              "domain":  "both",
                              "capability":  "Identity"
                          },
                          {
                              "courier":  "raijin",
                              "tail":  "tail-4-tools",
                              "adapter":  "grok",
                              "domain":  "engineering",
                              "capability":  "Actuation"
                          },
                          {
                              "courier":  "yuki",
                              "tail":  "tail-7-memory-context",
                              "adapter":  "claude",
                              "domain":  "engineering",
                              "capability":  "Perception"
                          },
                          {
                              "courier":  "goro",
                              "tail":  "tail-5-computer-files",
                              "adapter":  "llama",
                              "domain":  "engineering",
                              "capability":  "Capacity"
                          },
                          {
                              "courier":  "aria",
                              "tail":  "tail-9-citation",
                              "adapter":  "gemini",
                              "domain":  "engineering",
                              "capability":  "Alignment"
                          },
                          {
                              "courier":  "taro",
                              "tail":  "tail-3-knowledge-retrieval",
                              "adapter":  "openai-gpt",
                              "domain":  "engineering",
                              "capability":  "Knowledge"
                          },
                          {
                              "courier":  "sage",
                              "tail":  "tail-2-boundaries",
                              "adapter":  "qwen",
                              "domain":  "badminton",
                              "capability":  "Skills"
                          },
                          {
                              "courier":  "whisk",
                              "tail":  "tail-8-integrations",
                              "adapter":  "mistral",
                              "domain":  "badminton",
                              "capability":  "Distribution"
                          }
                      ]
};
