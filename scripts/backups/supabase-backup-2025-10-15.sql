-- Supabase Backup 2025-10-15
-- Generated: 2025-10-15T16:40:07.118Z
-- Total Tasks: 58
-- Total Users: 1

-- Tasks
CREATE TABLE IF NOT EXISTS tasks_backup (
  id text PRIMARY KEY,
  "userId" uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '' NOT NULL,
  notes text DEFAULT '' NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  priority boolean DEFAULT false NOT NULL,
  "dueDate" date,
  category text,
  tags jsonb DEFAULT '[]'::jsonb NOT NULL,
  subtasks jsonb DEFAULT '[]'::jsonb NOT NULL,
  "globalPosition" bigint NOT NULL,
  "createdAt" timestamptz DEFAULT now() NOT NULL,
  "updatedAt" timestamptz DEFAULT now() NOT NULL
);

INSERT INTO tasks_backup VALUES (
  'task_1760545875618_8l210qhjn',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'slides durchgehen',
  '',
  '',
  false,
  false,
  '2025-10-15',
  NULL,
  '[]',
  '[]',
  1760545875618,
  '2025-10-15T16:31:15.618+00:00',
  '2025-10-15T16:31:15.618+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1760545865267_vahidz1k2',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Tela mit Anneso',
  '',
  '',
  false,
  false,
  '2025-10-15',
  NULL,
  '[]',
  '[]',
  1760545865267,
  '2025-10-15T16:31:05.267+00:00',
  '2025-10-15T16:31:05.267+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1760545679956_2dwzgh1p6',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Freitag Tim und Whatsapp Gruppe',
  '',
  '',
  false,
  false,
  '2025-10-17',
  NULL,
  '[]',
  '[]',
  1760545679956,
  '2025-10-15T16:27:59.956+00:00',
  '2025-10-15T16:27:59.956+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1760545566984_8wb8hf71z',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Freitag calls zu Workshop Inhalten Webinare',
  '',
  '',
  false,
  false,
  '2025-10-17',
  NULL,
  '[]',
  '[]',
  2025101704,
  '2025-10-15T16:26:06.984+00:00',
  '2025-10-15T16:28:17.71536+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759928339325_pascal_fragen_ob_mon',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Pascal fragen ob Montag oder Dienstag schon mal 30 min vorbei für Dinge checken geht, wenn es geht Termin mit Fabian ausmachen',
  '',
  '',
  true,
  false,
  '2025-10-09',
  'Check24',
  '[]',
  '[]',
  2600,
  '2025-10-08T12:58:59.325+00:00',
  '2025-10-09T14:04:07.8+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759928104997_3_alte_kontakte_auf_',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '3 alte Kontakte auf LinkedIn anschreiben',
  '',
  '',
  true,
  false,
  '2025-10-09',
  NULL,
  '[]',
  '[]',
  2500,
  '2025-10-08T12:55:04.997+00:00',
  '2025-10-09T14:04:03.898+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759913089441_werk1',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'werk1 0/2',
  '',
  '',
  false,
  false,
  '2025-10-20',
  'Business',
  '[]',
  '[]',
  4200,
  '2025-10-08T08:44:49.441+00:00',
  '2025-10-15T16:30:15.090762+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759912910535_linkedin_und_5_alte_',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'LinkedIn und 5 alte und neue Sales Kontakte',
  '',
  '',
  true,
  false,
  '2025-10-08',
  'Business',
  '[]',
  '[]',
  2100,
  '2025-10-08T08:41:50.535+00:00',
  '2025-10-09T14:04:00.698+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759912879200_todolist_mit_meinem_',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Todolist mit meinem chatfirst prompt',
  '',
  '',
  true,
  false,
  '2025-10-08',
  NULL,
  '[]',
  '[]',
  1600,
  '2025-10-08T08:41:19.2+00:00',
  '2025-10-09T14:03:49.948+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759905581214_stefna_neuen_termin_',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Stefna neuen Termin senden',
  '',
  '',
  true,
  false,
  '2025-10-08',
  NULL,
  '[]',
  '[]',
  2200,
  '2025-10-08T06:39:41.214+00:00',
  '2025-10-09T14:04:01.931+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759905558487_check24_termin_schic',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Check24 Termin schicken',
  '',
  '',
  true,
  false,
  '2025-10-08',
  'Check24',
  '[]',
  '[]',
  1500,
  '2025-10-08T06:39:18.487+00:00',
  '2025-10-09T14:03:48.956+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759851076117_grafikstil_prompten_',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Alle slides und storyline checken',
  '',
  '',
  false,
  false,
  '2025-10-20',
  'Push Konferenz',
  '[]',
  '[]',
  5500,
  '2025-10-07T15:31:16.118+00:00',
  '2025-10-15T16:27:01.659156+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759850980710_pr_sentation_zusamme',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Präsentation zusammen bauen',
  '',
  '',
  true,
  false,
  '2025-10-07',
  'Push Konferenz',
  '[]',
  '[]',
  600,
  '2025-10-07T15:29:40.71+00:00',
  '2025-10-09T14:03:37.735+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759845284651_lululbullu',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'lululbullu',
  '',
  '',
  true,
  false,
  '2023-10-07',
  NULL,
  '[]',
  '[]',
  100,
  '2025-10-07T13:54:44.651+00:00',
  '2025-10-09T14:03:01.029+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759844662747_einen_task_f_r_heute',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'einen task für heute fällig mit den namen',
  '',
  '',
  true,
  false,
  '2025-10-07',
  NULL,
  '[]',
  '[]',
  1000,
  '2025-10-07T13:44:22.747+00:00',
  '2025-10-09T14:03:41.699+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_1759844468680__ber_meine_chat_firs',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Über meine chat first todo liste schreiben',
  '',
  '',
  true,
  false,
  '2025-10-08',
  'Werbung',
  '[]',
  '[]',
  1400,
  '2025-10-07T13:41:08.68+00:00',
  '2025-10-09T14:03:47.964+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_asterix_41_6',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Asterix 41',
  '',
  '',
  false,
  false,
  '2025-12-01',
  NULL,
  '[]',
  '[]',
  7100,
  '2025-10-07T11:51:41.71+00:00',
  '2025-10-09T14:02:07.782+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_junior_et_senior_4',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Junior et senior',
  '',
  '',
  false,
  false,
  '2025-12-01',
  NULL,
  '[]',
  '[]',
  6900,
  '2025-10-07T11:51:41.71+00:00',
  '2025-10-09T14:02:07.777+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_corto_maltese_manga_5',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Corto Maltese manga',
  '',
  '',
  false,
  false,
  '2025-12-01',
  NULL,
  '[]',
  '[]',
  7000,
  '2025-10-07T11:51:41.71+00:00',
  '2025-10-09T14:02:07.78+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_2_spirou_7',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '2 spirou',
  '',
  '',
  false,
  false,
  '2025-12-01',
  NULL,
  '[]',
  '[]',
  7200,
  '2025-10-07T11:51:41.71+00:00',
  '2025-10-09T14:02:07.784+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_dezember_januar_gr_ndungszusch_2',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Dezember/Januar Gründungszuschuss Antrag',
  '',
  '',
  false,
  false,
  '2025-12-01',
  NULL,
  '[]',
  '[]',
  6700,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.772+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___sp_testens_ende_dezember_202_2',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Spätestens Ende Dezember 2025** - Antrag für Gründungszuschuss stellen',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[{"id":"subtask___150_resttage_alg_i_3","title":"**150 Resttage ALG I** - Mindestanforderung am Antragstag erfüllen","completed":false}]',
  5800,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.755+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___150_resttage_alg_i_____minde_3',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**150 Resttage ALG I** - Mindestanforderung am Antragstag erfüllen',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[{"id":"subtask___besser_deutlich_fr_4","title":"**Besser deutlich früher** - Oktober bis Dezember 2025 für genug Bearbeitungszeit","completed":false}]',
  5900,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.757+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___besser_deutlich_fr_her_____o_4',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Besser deutlich früher** - Oktober bis Dezember 2025 für genug Bearbeitungszeit',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[]',
  6000,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.759+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___einkommensplan_erstellen_____5',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Einkommensplan erstellen** - ALG I + Gründungszuschuss kalkulieren:',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[{"id":"subtask___alg_i_h_he____65_3_6","title":"**ALG I Höhe:** 65,32 € täglich → 1.959,60 € monatlich","completed":false}]',
  6100,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.761+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___optimaler_zeitraum_planen____9',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Optimaler Zeitraum planen** - Oktober bis Dezember 2025 für Antrag',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[{"id":"subtask___szenario_november__10","title":"**Szenario November 2025:** Gründung Dezember 2025 → ALG I + Zuschuss bis Mai/Juni 2026","completed":false}]',
  6200,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.762+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___szenario_november_2025____gr_10',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Szenario November 2025:** Gründung Dezember 2025 → ALG I + Zuschuss bis Mai/Juni 2026',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[{"id":"subtask___szenario_dezember__11","title":"**Szenario Dezember 2025:** Gründung Januar 2026 → ALG I + Zuschuss bis Juni/Juli 2026","completed":false}]',
  6300,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.764+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___szenario_dezember_2025____gr_11',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Szenario Dezember 2025:** Gründung Januar 2026 → ALG I + Zuschuss bis Juni/Juli 2026',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[]',
  6400,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.767+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_slk_und_touran_t_v_12',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'SLK und Touran TÜV',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[]',
  6500,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.768+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___phase_2__9_monate__optional__8',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Phase 2 (9 Monate, optional):** Nur 300 € Zuschuss',
  '',
  '',
  false,
  false,
  '2025-11-01',
  NULL,
  '[]',
  '[]',
  6600,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.77+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_blake_et_mortimer_3',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Blake et mortimer',
  '',
  '',
  false,
  false,
  '2025-12-01',
  NULL,
  '[]',
  '[]',
  6800,
  '2025-10-07T11:51:41.709+00:00',
  '2025-10-09T14:02:07.774+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___olympia_b_rgerentscheid______2',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Olympia Bürgerentscheid** - Bürgerentscheid zur Olympia-Bewerbung 📁 Marketing',
  '',
  '',
  false,
  false,
  '2025-10-26',
  'Werbung',
  '["marketing"]',
  '[]',
  5600,
  '2025-10-07T11:51:41.708+00:00',
  '2025-10-09T14:02:07.752+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_immer__heldenverlies__klettrwa_6',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Immer: Heldenverlies, Klettrwald, Tauchen, superfly, Therme Erding,',
  '',
  '',
  false,
  false,
  '2025-10-18',
  NULL,
  '[]',
  '[]',
  5300,
  '2025-10-07T11:51:41.708+00:00',
  '2025-10-15T16:26:15.770583+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_schlafzimmer_rollos2025_10_111_3',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Schlafzimmer Rollos2025-10-111',
  '',
  '',
  false,
  false,
  '2025-10-18',
  NULL,
  '[]',
  '[]',
  5100,
  '2025-10-07T11:51:41.708+00:00',
  '2025-10-15T16:22:59.634765+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___steuer2024_____steuererkl_ru_4',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Steuer2024** - Steuererklärung 2024',
  '',
  '',
  false,
  false,
  '2025-10-18',
  'Personal',
  '["personal"]',
  '[]',
  5200,
  '2025-10-07T11:51:41.708+00:00',
  '2025-10-15T16:23:09.715512+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_nebenkostenabrechnungen_lich_v_7',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Nebenkostenabrechnungen Lich versenden',
  '',
  '',
  true,
  false,
  '2025-10-08',
  'Personal',
  '[]',
  '[]',
  2000,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-09T14:03:59.419+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_stromanbieter_2',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Stromanbieter',
  '',
  '',
  false,
  false,
  '2025-10-18',
  NULL,
  '[]',
  '[]',
  5400,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-15T16:22:48.220647+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___9_10__neue__berweisung_lunge_4',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**9.10. neue Überweisung Lungenarzt/Pneumologie abholen**',
  '',
  '',
  true,
  false,
  '2025-10-08',
  'Personal',
  '["personal"]',
  '[]',
  1900,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-09T14:03:58.292+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_0_3_werk1_2',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '1/3 werk1',
  '',
  '',
  true,
  false,
  '2025-10-08',
  NULL,
  '[]',
  '[]',
  1800,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-09T14:03:57.009+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___marketing_seiten_aufr_umen___16',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Marketing und Sales Seiten aufäumen',
  '',
  '',
  false,
  false,
  '2025-10-20',
  'Development',
  '["morning","development","marketing"]',
  '[]',
  5400,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-15T16:24:52.102656+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_mieterverein_doppelt_5',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Mieterverein doppelt',
  '',
  '',
  false,
  false,
  '2025-10-18',
  NULL,
  '[]',
  '[]',
  3100,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-15T16:24:19.868356+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___pricing_ideen_sammeln__sales_15',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  '**Pricing-Ideen sammeln (Sales Seiten aufräumen)** - Alle Pricing-Strategien und Ideen strukturieren: 🌅 📁 Personal',
  '',
  '',
  false,
  false,
  '2025-10-27',
  'Business',
  '["morning","business"]',
  '[]',
  5700,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-09T14:02:07.753+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_huk_3',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Huk',
  '',
  '',
  true,
  false,
  '2025-10-09',
  NULL,
  '[]',
  '[]',
  3000,
  '2025-10-07T11:51:41.707+00:00',
  '2025-10-09T14:04:49.189+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown___linkend_in_post_____i_m_back_14',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Linkend In Post - I am back at preparing my breakout session for PUSH. Right now I am optimizing the prompting techniques I started earlier this year focused on flow-based, user-task-driven interfaces. I have been running new tests, rediscovering a few old views, and working hard to compress everything into a sharp one-hour format (no small feat). Over the next weeks, I will share more glimpses into these breakout tests and what I am teaching. Here is the first one stay tuned.',
  '',
  '',
  true,
  false,
  '2025-10-07',
  'Werbung',
  '["urgent","PUSH","social-media"]',
  '[]',
  900,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-09T14:03:40.566+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_noch_mehr_rauskommen_aus_dem_h_20',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Noch mehr rauskommen aus dem Haus planen!!! 📁 Marketing',
  '',
  '',
  false,
  false,
  '2025-10-17',
  'Werbung',
  '["marketing"]',
  '[]',
  4600,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-15T16:23:24.935954+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_microcopy_mit_psychology_noch__38',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'microcopy mit psychology noch mal checken 📁 PUSH',
  '',
  '',
  false,
  false,
  '2025-10-20',
  'Push Konferenz',
  '["PUSH"]',
  '[]',
  5000,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-15T16:29:04.848856+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_guided_interactions_noch_mal_c_37',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'guided interactions noch mal checken, confirm and acknowledge 📁 PUSH',
  '',
  '',
  false,
  false,
  '2025-10-20',
  'Push Konferenz',
  '["PUSH"]',
  '[]',
  4900,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-15T16:29:14.902946+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_daily_repeat_und_hub_optimiere_36',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'daily repeat und hub optimieren 📁 PUSH',
  '',
  '',
  false,
  false,
  '2025-10-20',
  'Push Konferenz',
  '["PUSH"]',
  '[]',
  4800,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-15T16:29:26.176589+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_check24_genaues_briefing_f_r_d_48',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Check24 genaues Briefing für den Konzepter, exakte planung',
  '',
  '',
  true,
  false,
  '2025-10-08',
  'Check24',
  '[]',
  '[{"id":"subtask_check24_materialien__49","title":"Check24 Materialien?!? 📁 Check24","completed":false}]',
  1700,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-09T14:03:51.309+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_cv_dieses_jahr_update__laura___23',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'CV dieses Jahr Update: Laura, Substain, Prompting Birds, 36Zerovision, Check24!, PUSH Conference, AI Rapid Prototyping mit eigenen Tools, die figma ersetzen, bekannter Experte und Berater von Teams und Freelnacer von Check24 bis SAP Innovation zu diesem Thema.� Marketing 🔥 📁 Marketing',
  '',
  '',
  false,
  false,
  '2025-10-17',
  'Werbung',
  '["urgent","PUSH"]',
  '[]',
  4000,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-15T16:27:16.040231+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_mit_anna_abgleich___check24_55',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'mit anna abgleich',
  '',
  '',
  true,
  false,
  '2025-10-09',
  'Check24',
  '[]',
  '[]',
  2575,
  '2025-10-07T11:51:41.706+00:00',
  '2025-10-09T14:16:09.759+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_steffen_app_schicken___develop_3',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Steffen app schicken 📁 Development',
  '',
  '',
  true,
  false,
  '2025-10-06',
  NULL,
  '[]',
  '[]',
  400,
  '2025-10-07T11:51:41.705+00:00',
  '2025-10-09T14:03:29.881+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_pascal_antworten_4',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Pascal antworten',
  '',
  '',
  true,
  false,
  '2025-10-06',
  NULL,
  '[]',
  '[]',
  500,
  '2025-10-07T11:51:41.705+00:00',
  '2025-10-09T14:03:31.132+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_tim_wg__coaching____urgent_9',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Tim wg. Coaching 🔥 📁 Urgent',
  '',
  '',
  true,
  false,
  '2025-10-07',
  NULL,
  '["urgent"]',
  '[]',
  700,
  '2025-10-07T11:51:41.705+00:00',
  '2025-10-09T14:03:38.883+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_tabs____personal_5',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Tabs 🌅 📁 Personal',
  '',
  '',
  true,
  false,
  '2025-10-07',
  NULL,
  '["morning"]',
  '[]',
  1200,
  '2025-10-07T11:51:41.705+00:00',
  '2025-10-09T14:03:44.114+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_pascak_anrufen____business_10',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Pascak anrufen 🔥 📁 Business',
  '',
  '',
  true,
  false,
  '2025-10-07',
  'Check24',
  '["urgent","business"]',
  '[]',
  800,
  '2025-10-07T11:51:41.705+00:00',
  '2025-10-09T14:03:39.754+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_little_sorting_bis_zur_nas_6',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Little sorting bis zur NAS',
  '',
  '',
  true,
  false,
  '2025-10-07',
  NULL,
  '[]',
  '[]',
  1300,
  '2025-10-07T11:51:41.705+00:00',
  '2025-10-09T14:03:45.204+00:00'
);
INSERT INTO tasks_backup VALUES (
  'task_unknown_mails_3',
  'eac26eeb-8950-418c-8be7-eba03ad606ec',
  'Mails',
  '',
  '',
  true,
  false,
  '2025-10-07',
  NULL,
  '[]',
  '[]',
  1100,
  '2025-10-07T11:51:41.705+00:00',
  '2025-10-09T14:03:42.929+00:00'
);

-- Users (Auth)
-- Note: User data is stored in Supabase Auth, not in custom tables
-- User IDs are referenced in tasks.userId

-- User: jensrusi@gmail.com (eac26eeb-8950-418c-8be7-eba03ad606ec)
-- Created: 2025-10-15T16:07:46.880088Z
-- Last Sign In: 2025-10-15T16:07:48.53462Z

