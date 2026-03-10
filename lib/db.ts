import { Pool } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
  }
  return pool
}

export async function ensureTable(): Promise<void> {
  const db = getPool()
  await db.query(`
    CREATE TABLE IF NOT EXISTS osl_survey_v2 (
      id                  SERIAL PRIMARY KEY,
      submitted_at        TIMESTAMPTZ DEFAULT NOW(),
      ip                  TEXT,
      -- Section A
      full_name           TEXT,
      email               TEXT,
      unit                TEXT,
      duty_station        TEXT,
      country_office      TEXT,
      -- Section B
      typical_week        TEXT,
      data_tracked        TEXT,
      tools_used          TEXT[],
      other_tools         TEXT,
      biggest_challenge   TEXT,
      data_frequency      TEXT,
      -- Section C
      kpis_selected       TEXT[],
      custom_kpis         TEXT,
      top3_rank1          TEXT,
      top3_rank1_why      TEXT,
      top3_rank2          TEXT,
      top3_rank2_why      TEXT,
      top3_rank3          TEXT,
      top3_rank3_why      TEXT,
      -- Section D
      input_methods       TEXT[],
      devices_used        TEXT[],
      update_frequency    TEXT,
      input_constraints   TEXT,
      -- Section E
      first_view          TEXT,
      viz_types           TEXT[],
      dedicated_section   TEXT,
      key_variables       TEXT,
      viewers             TEXT[],
      -- Section F
      report_formats      TEXT[],
      report_detail_level TEXT,
      publication_data    TEXT,
      reporting_deadlines TEXT,
      importance_rating   INT,
      -- Section G
      special_requests    TEXT,
      integrations_needed TEXT,
      indispensable       TEXT,
      open_wishlist       TEXT
    )
  `)
}

export async function insertResponse(d: Record<string, unknown>): Promise<void> {
  await ensureTable()
  const db = getPool()
  await db.query(`
    INSERT INTO osl_survey_v2 (
      ip, full_name, email, unit, duty_station, country_office,
      typical_week, data_tracked, tools_used, other_tools, biggest_challenge, data_frequency,
      kpis_selected, custom_kpis,
      top3_rank1, top3_rank1_why, top3_rank2, top3_rank2_why, top3_rank3, top3_rank3_why,
      input_methods, devices_used, update_frequency, input_constraints,
      first_view, viz_types, dedicated_section, key_variables, viewers,
      report_formats, report_detail_level, publication_data, reporting_deadlines, importance_rating,
      special_requests, integrations_needed, indispensable, open_wishlist
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,$11,$12,
      $13,$14,
      $15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,
      $25,$26,$27,$28,$29,
      $30,$31,$32,$33,$34,
      $35,$36,$37,$38
    )
  `, [
    d.ip, d.fullName, d.email, d.unit, d.dutyStation, d.countryOffice,
    d.typicalWeek, d.dataTracked, d.toolsUsed||[], d.otherTools, d.biggestChallenge, d.dataFrequency,
    d.kpisSelected||[], d.customKpis,
    d.top3Rank1, d.top3Rank1Why, d.top3Rank2, d.top3Rank2Why, d.top3Rank3, d.top3Rank3Why,
    d.inputMethods||[], d.devicesUsed||[], d.updateFrequency, d.inputConstraints,
    d.firstView, d.vizTypes||[], d.dedicatedSection, d.keyVariables, d.viewers||[],
    d.reportFormats||[], d.reportDetailLevel, d.publicationData, d.reportingDeadlines,
    d.importanceRating||null,
    d.specialRequests, d.integrationsNeeded, d.indispensable, d.openWishlist,
  ])
}

export async function getAll(): Promise<Record<string, unknown>[]> {
  await ensureTable()
  const db = getPool()
  const r = await db.query('SELECT * FROM osl_survey_v2 ORDER BY submitted_at DESC')
  return r.rows
}
