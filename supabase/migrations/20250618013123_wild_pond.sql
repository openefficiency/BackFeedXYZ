/*
  # Verify Database Schema and Populate with Comprehensive Dummy Data
  
  This migration will:
  1. Verify all tables exist with correct structure
  2. Insert comprehensive dummy data for testing
  3. Ensure proper relationships and constraints
  4. Add realistic sample cases for demonstration
*/

-- First, let's verify our tables exist and have the correct structure
DO $$
BEGIN
  -- Check if all required tables exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
    RAISE EXCEPTION 'Table cases does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transcripts') THEN
    RAISE EXCEPTION 'Table transcripts does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hr_interactions') THEN
    RAISE EXCEPTION 'Table hr_interactions does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_insights') THEN
    RAISE EXCEPTION 'Table ai_insights does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hr_users') THEN
    RAISE EXCEPTION 'Table hr_users does not exist';
  END IF;
  
  RAISE NOTICE 'All required tables exist';
END $$;

-- Clear existing data to avoid conflicts
TRUNCATE TABLE ai_insights CASCADE;
TRUNCATE TABLE hr_interactions CASCADE;
TRUNCATE TABLE transcripts CASCADE;
TRUNCATE TABLE cases CASCADE;
TRUNCATE TABLE hr_users CASCADE;

-- Insert HR Users first (needed for foreign key references)
INSERT INTO hr_users (name, email, role, department) VALUES
  ('Sarah Johnson', 'hr@company.com', 'hr_manager', 'Human Resources'),
  ('Michael Chen', 'admin@company.com', 'hr_admin', 'Human Resources'),
  ('Emily Rodriguez', 'specialist@company.com', 'hr_specialist', 'Employee Relations'),
  ('David Kim', 'david.kim@company.com', 'hr_director', 'Human Resources'),
  ('Lisa Wang', 'lisa.wang@company.com', 'hr_coordinator', 'Human Resources');

-- Insert comprehensive test cases with various scenarios
INSERT INTO cases (confirmation_code, category, summary, severity, status, created_at, updated_at) VALUES
  -- High priority safety case
  ('AB7X9K2M4P', 'Workplace Safety', 'Employee reported serious safety concerns about unmaintained equipment and undocumented near-miss incidents. Multiple safety protocol violations observed in manufacturing area. Immediate attention required to prevent potential accidents.', 4, 'investigating', '2025-01-17T10:30:00Z', '2025-01-18T14:15:00Z'),
  
  -- Harassment case
  ('CD8Y5N3Q1R', 'Harassment', 'Report of inappropriate behavior and discriminatory comments from supervisor creating hostile work environment. Multiple witnesses available. Employee experiencing stress and considering resignation due to ongoing harassment.', 4, 'open', '2025-01-17T09:15:00Z', '2025-01-17T09:15:00Z'),
  
  -- Policy violation - resolved
  ('EF9Z6P4S2T', 'Policy Violation', 'Concerns about inconsistent break time policy enforcement causing unfair work distribution. Some employees taking extended breaks while others cover responsibilities. Management oversight needed.', 2, 'closed', '2025-01-16T15:45:00Z', '2025-01-17T08:30:00Z'),
  
  -- Critical discrimination case
  ('GH1A7R5U3V', 'Discrimination', 'Report of systematic discriminatory hiring practices based on age and gender. Pattern observed in recent hiring decisions and promotion opportunities. Legal compliance review required immediately.', 5, 'investigating', '2025-01-16T11:20:00Z', '2025-01-18T13:45:00Z'),
  
  -- Communication issues
  ('JK2B8S6W4X', 'Workplace Environment', 'Poor interdepartmental communication causing project delays and employee frustration. Information sharing gaps affecting team morale and delivery timelines. Process improvement needed.', 3, 'open', '2025-01-16T14:30:00Z', '2025-01-16T14:30:00Z'),
  
  -- Benefits inquiry - resolved
  ('LM3C9T7Y5Z', 'Benefits Inquiry', 'Questions about recent health insurance and retirement plan changes. Employee needs clarification on coverage options and enrollment procedures. Information provided and resolved.', 1, 'closed', '2025-01-15T16:20:00Z', '2025-01-16T10:15:00Z'),
  
  -- Another safety case
  ('NP4D1U8Z6A', 'Workplace Safety', 'Inadequate safety training for new equipment installation. Lack of proper protective gear and safety protocols. Risk of serious injury if not addressed immediately.', 4, 'investigating', '2025-01-15T13:45:00Z', '2025-01-18T11:30:00Z'),
  
  -- Work-life balance
  ('QR5E2V9A7B', 'Work-Life Balance', 'Excessive mandatory overtime affecting employee health and family relationships. Request for review of current scheduling practices and better work-life balance policies.', 3, 'open', '2025-01-15T12:10:00Z', '2025-01-15T12:10:00Z'),
  
  -- Recent cases for testing
  ('ST6F3W1Y8C', 'Harassment', 'Inappropriate comments and behavior from team lead during meetings. Creating uncomfortable work environment for multiple team members. Witnesses willing to provide statements.', 4, 'open', '2025-01-18T09:30:00Z', '2025-01-18T09:30:00Z'),
  
  ('UV7G4X2Z9D', 'Workplace Environment', 'Lack of proper ventilation and lighting in workspace affecting employee health and productivity. Multiple complaints about headaches and eye strain. Facility improvement needed.', 2, 'open', '2025-01-18T11:45:00Z', '2025-01-18T11:45:00Z'),
  
  ('WX8H5Y3A1E', 'Policy Violation', 'Manager consistently arriving late and leaving early while enforcing strict attendance for team members. Double standard creating resentment and affecting team morale.', 3, 'investigating', '2025-01-18T13:20:00Z', '2025-01-18T15:10:00Z'),
  
  ('YZ9I6Z4B2F', 'Discrimination', 'Qualified female candidates consistently passed over for promotions in favor of less experienced male colleagues. Pattern suggests gender bias in advancement decisions.', 5, 'investigating', '2025-01-18T14:15:00Z', '2025-01-18T16:30:00Z');

-- Insert realistic transcripts for each case
INSERT INTO transcripts (case_id, raw_transcript, processed_summary, sentiment_score) 
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'I need to report serious safety concerns in our manufacturing department. The equipment hasnt been properly maintained for months and there have been several near-miss incidents that management isnt documenting properly. Just last week, the conveyor belt malfunctioned and almost caught someones clothing. The safety guards are loose and some are missing entirely. Im really worried someone is going to get seriously hurt if we dont address this immediately. When we bring these concerns up in safety meetings, management just says theyll look into it but nothing ever changes.'
    WHEN 'CD8Y5N3Q1R' THEN 'I need to report my supervisor for inappropriate behavior and harassment. He has been making inappropriate comments about my appearance and other female employees. He also makes discriminatory remarks about our capabilities and assigns us less important tasks. This has been going on for about three months now and its creating a really hostile work environment. Other team members have noticed it too but theyre afraid to speak up because hes in charge of performance reviews. I dread coming to work every day and its affecting my mental health.'
    WHEN 'EF9Z6P4S2T' THEN 'I want to bring up concerns about break time policies not being enforced fairly. Some employees regularly take 30-45 minute breaks when theyre supposed to be 15 minutes, while others stick to the rules. The people taking longer breaks are friends with the supervisor so nothing gets said to them. Meanwhile, those of us following the rules have to cover their work and pick up the slack. Its creating a lot of resentment and unfairness in the team. Management needs to either enforce the policy consistently or change it for everyone.'
    WHEN 'GH1A7R5U3V' THEN 'I believe there are serious discriminatory hiring practices happening in our department. Over the past year, Ive observed a clear pattern where qualified female and older candidates are being passed over for positions and promotions in favor of younger male candidates with less experience. In the last three hiring rounds, despite having strong female candidates who interviewed well, they chose men every time. The same thing is happening with promotions - women and older employees are consistently overlooked. This needs to be investigated immediately because I think were violating equal opportunity employment laws.'
    WHEN 'JK2B8S6W4X' THEN 'There are serious communication problems between departments that are causing major project delays and a lot of frustration. Information isnt being shared properly between teams, deadlines are being missed because nobody knows what the other departments are doing, and were constantly duplicating work or working at cross purposes. The lack of coordination is really affecting morale and our ability to deliver quality work on time. We need better communication systems and regular interdepartmental meetings to keep everyone on the same page.'
    WHEN 'LM3C9T7Y5Z' THEN 'I have questions about the recent changes to our health insurance and retirement benefits package. The information that was sent out was really confusing and I need clarification on how these changes affect my current coverage and what my options are for enrollment. Specifically, I need to understand the new deductible amounts, what doctors are still covered, and how the retirement matching has changed. Can someone from HR help explain these changes in plain language?'
    WHEN 'NP4D1U8Z6A' THEN 'Im very concerned about the safety training for the new equipment that was installed in our department last month. The training session was only two hours long and didnt cover all the safety protocols properly. We also dont have the right protective equipment - the safety goggles dont fit properly and some of the guards are missing from the machines. This equipment is dangerous and I think someone could get seriously injured if we dont get proper training and safety equipment. We shouldnt be using this equipment until these issues are resolved.'
    WHEN 'QR5E2V9A7B' THEN 'The excessive overtime requirements are really affecting my work-life balance and my health. For the past two months, weve been required to work mandatory overtime almost every week, sometimes 12-hour days. Its affecting my family time, my sleep, and my overall well-being. I understand that sometimes overtime is necessary, but this has become the norm rather than the exception. I think we need to review our staffing levels and scheduling practices to find a better balance that doesnt burn out employees.'
    WHEN 'ST6F3W1Y8C' THEN 'I need to report inappropriate behavior from our team lead during meetings and daily interactions. He makes comments about peoples appearance, especially the women on the team, and makes jokes that make people uncomfortable. He also has a habit of interrupting women when theyre speaking and dismissing their ideas, but he listens respectfully when men speak. Several of us have noticed this pattern and its creating a really uncomfortable work environment. Some team members have started avoiding meetings or speaking up because of his behavior.'
    WHEN 'UV7G4X2Z9D' THEN 'I want to report concerns about our workspace conditions that are affecting employee health and productivity. The ventilation system in our area hasnt been working properly for weeks - its stuffy and the air feels stale. The lighting is also inadequate, with several fluorescent bulbs burned out and not replaced. Multiple people have complained about headaches and eye strain. These conditions are making it hard to concentrate and do our jobs effectively. We need facilities management to address these issues as soon as possible.'
    WHEN 'WX8H5Y3A1E' THEN 'I want to report a double standard with attendance policies. Our manager consistently arrives 30-45 minutes late and leaves early, but enforces very strict attendance rules for the rest of the team. If any of us are even 10 minutes late, we get written up, but nothing is ever said about his tardiness. He also takes long lunches and personal calls during work hours. This is creating a lot of resentment in the team because we feel like there are different rules for management versus regular employees. Its affecting team morale and respect for leadership.'
    WHEN 'YZ9I6Z4B2F' THEN 'I believe there is gender discrimination happening in our promotion and advancement processes. Over the past 18 months, Ive watched several highly qualified women get passed over for promotions and leadership roles in favor of men with less experience and qualifications. In my own case, I was told I needed more experience, but then they promoted a male colleague who started after me and has fewer certifications. This pattern is happening across multiple departments and I think it needs to be investigated. Women are being held to higher standards and not given equal opportunities for advancement.'
  END,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'Safety concerns regarding unmaintained equipment and undocumented incidents in manufacturing. Employee reports near-miss incidents and requests immediate attention to prevent accidents.'
    WHEN 'CD8Y5N3Q1R' THEN 'Supervisor harassment including inappropriate comments and discriminatory behavior creating hostile work environment. Multiple witnesses available.'
    WHEN 'EF9Z6P4S2T' THEN 'Inconsistent break policy enforcement causing unfair work distribution and team resentment. Management oversight needed for consistent application.'
    WHEN 'GH1A7R5U3V' THEN 'Systematic discriminatory hiring practices based on gender and age. Pattern observed in recent hiring and promotion decisions requiring legal review.'
    WHEN 'JK2B8S6W4X' THEN 'Poor interdepartmental communication causing project delays and affecting team morale. Need for improved coordination systems.'
    WHEN 'LM3C9T7Y5Z' THEN 'Request for clarification on recent health insurance and retirement benefit changes. Employee needs assistance understanding new coverage options.'
    WHEN 'NP4D1U8Z6A' THEN 'Inadequate safety training and protective equipment for new machinery. Risk of serious injury without proper protocols and gear.'
    WHEN 'QR5E2V9A7B' THEN 'Excessive mandatory overtime affecting work-life balance and employee health. Request for review of scheduling practices.'
    WHEN 'ST6F3W1Y8C' THEN 'Team lead inappropriate behavior and comments creating uncomfortable work environment. Pattern of dismissive behavior toward women.'
    WHEN 'UV7G4X2Z9D' THEN 'Workspace conditions affecting health and productivity. Ventilation and lighting issues causing employee discomfort.'
    WHEN 'WX8H5Y3A1E' THEN 'Double standard in attendance policy enforcement. Manager tardiness while enforcing strict rules for team members.'
    WHEN 'YZ9I6Z4B2F' THEN 'Gender discrimination in promotion processes. Qualified women consistently passed over for less experienced male colleagues.'
  END,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN -0.4
    WHEN 'CD8Y5N3Q1R' THEN -0.7
    WHEN 'EF9Z6P4S2T' THEN -0.3
    WHEN 'GH1A7R5U3V' THEN -0.8
    WHEN 'JK2B8S6W4X' THEN -0.2
    WHEN 'LM3C9T7Y5Z' THEN 0.1
    WHEN 'NP4D1U8Z6A' THEN -0.5
    WHEN 'QR5E2V9A7B' THEN -0.3
    WHEN 'ST6F3W1Y8C' THEN -0.6
    WHEN 'UV7G4X2Z9D' THEN -0.2
    WHEN 'WX8H5Y3A1E' THEN -0.4
    WHEN 'YZ9I6Z4B2F' THEN -0.7
  END
FROM cases c;

-- Insert initial system messages for all cases
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  'Thank you for your report. We have received your feedback and have assigned it to our team for investigation. We take all employee concerns seriously and will keep you updated on our progress. Your case has been assigned confirmation code ' || c.confirmation_code || ' for tracking purposes.',
  'system',
  'System',
  c.created_at + INTERVAL '5 minutes'
FROM cases c;

-- Add follow-up messages for investigating cases
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'We have initiated a comprehensive safety investigation. Our safety officer will be conducting an equipment assessment and reviewing all incident documentation. We are also scheduling interviews with department personnel. We expect to have an initial update within 48 hours and will implement immediate safety measures as needed.'
    WHEN 'GH1A7R5U3V' THEN 'Your discrimination report is being thoroughly investigated by our compliance team in consultation with our legal department. We are reviewing all hiring records from the past 18 months and will be conducting confidential interviews with relevant personnel. This matter is being treated with the highest priority and we will ensure full compliance with equal opportunity employment laws.'
    WHEN 'NP4D1U8Z6A' THEN 'We are immediately reviewing the safety training protocols for the new equipment. As a precautionary measure, please do not operate the equipment until proper training and protective gear are provided. We are scheduling comprehensive safety training sessions this week and ordering appropriate protective equipment. Your safety is our top priority.'
    WHEN 'WX8H5Y3A1E' THEN 'We are investigating the attendance policy concerns you raised. We will be reviewing attendance records and scheduling a meeting with the department manager to address the consistency issues. All employees, regardless of position, are expected to follow company policies. We will ensure fair and consistent application of all workplace policies.'
    WHEN 'YZ9I6Z4B2F' THEN 'Your concerns about potential gender discrimination in promotions are being investigated by our HR compliance team. We are conducting a comprehensive review of all promotion decisions over the past 18 months, including evaluation criteria and decision-making processes. We are committed to ensuring equal opportunities for all employees and will take corrective action if any bias is identified.'
  END,
  'hr_manager',
  'Sarah Johnson',
  c.updated_at
FROM cases c 
WHERE c.status = 'investigating';

-- Add closure messages for closed cases
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'EF9Z6P4S2T' THEN 'We have addressed the break time policy concerns with department management and implemented a new monitoring system. All employees have been reminded of the proper break time procedures and supervisors have been instructed to enforce policies consistently. We have also established a clear escalation process for policy violations. Thank you for bringing this to our attention.'
    WHEN 'LM3C9T7Y5Z' THEN 'We have sent you detailed information about the benefits changes via email, including a comprehensive comparison chart and FAQ document. Our benefits coordinator is also available for one-on-one consultations if you need additional clarification. Your case has been resolved, but please feel free to contact us if you have any additional questions about your benefits.'
  END,
  'hr_manager',
  'Sarah Johnson',
  c.updated_at
FROM cases c 
WHERE c.status = 'closed';

-- Add some employee responses to show two-way communication
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'Thank you for the quick response. I wanted to add that there was another incident yesterday where the emergency stop button on machine #3 didnt work properly. The operator had to manually shut down the machine. I think this should be part of your investigation.'
    WHEN 'CD8Y5N3Q1R' THEN 'I appreciate that this is being taken seriously. I have documented several specific incidents with dates and times. There are also two other employees who witnessed some of these incidents and are willing to provide statements if needed.'
    WHEN 'GH1A7R5U3V' THEN 'Thank you for investigating this. I have additional documentation including job postings, interview feedback, and promotion announcements that show the pattern I mentioned. I can provide these to support the investigation.'
  END,
  'employee',
  'Anonymous',
  c.updated_at + INTERVAL '2 hours'
FROM cases c 
WHERE c.confirmation_code IN ('AB7X9K2M4P', 'CD8Y5N3Q1R', 'GH1A7R5U3V');

-- Insert comprehensive AI insights for all cases
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'risk_assessment',
  jsonb_build_object(
    'risk_level', c.severity,
    'risk_factors', CASE 
      WHEN c.category = 'Workplace Safety' THEN ARRAY['Physical harm potential', 'Regulatory compliance', 'Equipment failure', 'OSHA violations']
      WHEN c.category = 'Harassment' THEN ARRAY['Legal liability', 'Employee retention', 'Workplace culture', 'Hostile environment claims']
      WHEN c.category = 'Discrimination' THEN ARRAY['Legal compliance', 'EEOC violations', 'Reputation risk', 'Class action potential']
      WHEN c.category = 'Policy Violation' THEN ARRAY['Operational efficiency', 'Employee fairness', 'Management credibility']
      WHEN c.category = 'Work-Life Balance' THEN ARRAY['Employee burnout', 'Turnover risk', 'Productivity decline']
      WHEN c.category = 'Workplace Environment' THEN ARRAY['Employee satisfaction', 'Productivity impact', 'Health concerns']
      ELSE ARRAY['General workplace concern', 'Employee relations']
    END,
    'immediate_action_required', c.severity >= 4,
    'estimated_impact', CASE 
      WHEN c.severity >= 4 THEN 'High'
      WHEN c.severity >= 3 THEN 'Medium'
      ELSE 'Low'
    END,
    'legal_risk', CASE
      WHEN c.category IN ('Discrimination', 'Harassment') THEN 'High'
      WHEN c.category = 'Workplace Safety' THEN 'Medium'
      ELSE 'Low'
    END
  ),
  0.85
FROM cases c;

-- Insert next steps insights
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'next_steps',
  jsonb_build_object(
    'recommended_actions', CASE c.category
      WHEN 'Workplace Safety' THEN ARRAY['Conduct immediate safety audit', 'Review equipment maintenance logs', 'Interview department supervisors', 'Update safety protocols', 'Provide additional safety training', 'Ensure OSHA compliance']
      WHEN 'Harassment' THEN ARRAY['Interview complainant in detail', 'Interview accused party', 'Interview witnesses', 'Review company policies', 'Document all interactions', 'Consider disciplinary action', 'Provide harassment training']
      WHEN 'Discrimination' THEN ARRAY['Review hiring records comprehensively', 'Interview hiring managers', 'Audit promotion processes', 'Consult legal team', 'Implement bias training', 'Review job descriptions', 'Ensure EEOC compliance']
      WHEN 'Policy Violation' THEN ARRAY['Review current policies', 'Meet with management', 'Implement monitoring system', 'Communicate expectations clearly', 'Provide manager training']
      WHEN 'Work-Life Balance' THEN ARRAY['Review staffing levels', 'Analyze overtime patterns', 'Consider flexible scheduling', 'Evaluate workload distribution', 'Implement wellness programs']
      WHEN 'Workplace Environment' THEN ARRAY['Conduct facility inspection', 'Address immediate health concerns', 'Improve communication systems', 'Implement regular check-ins']
      ELSE ARRAY['Investigate thoroughly', 'Document findings', 'Take appropriate action', 'Follow up with employee']
    END,
    'timeline', CASE 
      WHEN c.severity >= 4 THEN '24-48 hours'
      WHEN c.severity >= 3 THEN '3-5 business days'
      ELSE '1-2 weeks'
    END,
    'priority', CASE 
      WHEN c.severity >= 4 THEN 'Urgent'
      WHEN c.severity >= 3 THEN 'High'
      ELSE 'Normal'
    END,
    'estimated_resolution_time', CASE
      WHEN c.category IN ('Discrimination', 'Harassment') THEN '2-4 weeks'
      WHEN c.category = 'Workplace Safety' THEN '1-2 weeks'
      ELSE '1 week'
    END
  ),
  0.78
FROM cases c;

-- Insert sentiment analysis insights
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'sentiment_analysis',
  jsonb_build_object(
    'overall_sentiment', CASE 
      WHEN t.sentiment_score <= -0.6 THEN 'Very Negative'
      WHEN t.sentiment_score <= -0.3 THEN 'Negative'
      WHEN t.sentiment_score <= 0.1 THEN 'Neutral'
      WHEN t.sentiment_score <= 0.5 THEN 'Positive'
      ELSE 'Very Positive'
    END,
    'sentiment_score', t.sentiment_score,
    'emotional_indicators', CASE 
      WHEN t.sentiment_score <= -0.6 THEN ARRAY['High frustration', 'Anger', 'Distress', 'Fear']
      WHEN t.sentiment_score <= -0.4 THEN ARRAY['Frustration', 'Concern', 'Anxiety', 'Disappointment']
      WHEN t.sentiment_score <= -0.2 THEN ARRAY['Mild concern', 'Worry', 'Dissatisfaction']
      ELSE ARRAY['Professional tone', 'Constructive feedback', 'Calm demeanor']
    END,
    'urgency_level', CASE 
      WHEN t.sentiment_score <= -0.6 THEN 'High'
      WHEN t.sentiment_score <= -0.3 THEN 'Medium'
      ELSE 'Low'
    END,
    'employee_stress_level', CASE
      WHEN t.sentiment_score <= -0.6 THEN 'High stress - immediate support needed'
      WHEN t.sentiment_score <= -0.4 THEN 'Moderate stress - monitor closely'
      ELSE 'Normal stress levels'
    END
  ),
  0.82
FROM cases c
JOIN transcripts t ON c.id = t.case_id;

-- Insert similar cases insights for pattern recognition
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'similar_cases',
  jsonb_build_object(
    'similar_case_count', (
      SELECT COUNT(*) 
      FROM cases c2 
      WHERE c2.category = c.category 
      AND c2.id != c.id 
      AND c2.created_at >= c.created_at - INTERVAL '6 months'
    ),
    'pattern_detected', CASE
      WHEN c.category IN ('Workplace Safety', 'Harassment', 'Discrimination') THEN true
      ELSE false
    END,
    'trend_analysis', CASE c.category
      WHEN 'Workplace Safety' THEN 'Multiple safety incidents reported - systematic review needed'
      WHEN 'Harassment' THEN 'Pattern of harassment reports - culture assessment recommended'
      WHEN 'Discrimination' THEN 'Discrimination concerns across departments - policy review required'
      ELSE 'Isolated incident - standard processing'
    END,
    'recommended_preventive_measures', CASE c.category
      WHEN 'Workplace Safety' THEN ARRAY['Enhanced safety training', 'Regular equipment audits', 'Safety culture improvement']
      WHEN 'Harassment' THEN ARRAY['Mandatory harassment training', 'Clear reporting procedures', 'Regular culture surveys']
      WHEN 'Discrimination' THEN ARRAY['Bias training for managers', 'Diverse hiring panels', 'Regular equity audits']
      ELSE ARRAY['Regular policy reviews', 'Employee feedback sessions']
    END
  ),
  0.75
FROM cases c;

-- Verify data insertion
DO $$
DECLARE
  case_count INTEGER;
  transcript_count INTEGER;
  interaction_count INTEGER;
  insight_count INTEGER;
  hr_user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO case_count FROM cases;
  SELECT COUNT(*) INTO transcript_count FROM transcripts;
  SELECT COUNT(*) INTO interaction_count FROM hr_interactions;
  SELECT COUNT(*) INTO insight_count FROM ai_insights;
  SELECT COUNT(*) INTO hr_user_count FROM hr_users;
  
  RAISE NOTICE 'Data insertion completed successfully:';
  RAISE NOTICE '- Cases: %', case_count;
  RAISE NOTICE '- Transcripts: %', transcript_count;
  RAISE NOTICE '- HR Interactions: %', interaction_count;
  RAISE NOTICE '- AI Insights: %', insight_count;
  RAISE NOTICE '- HR Users: %', hr_user_count;
  
  IF case_count = 0 THEN
    RAISE EXCEPTION 'No cases were inserted - check for errors';
  END IF;
END $$;