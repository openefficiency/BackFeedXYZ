/*
  # Comprehensive Test Data for Voice AI Agent System
  
  This migration creates realistic dummy data for testing all database functionality:
  1. Sample HR users with known credentials
  2. Realistic employee feedback cases
  3. Full conversation transcripts
  4. HR interactions and system messages
  5. AI insights for each case
  
  Test Credentials:
  - Email: hr@company.com, Password: demo123
  - Email: admin@company.com, Password: admin123  
  - Email: test@company.com, Password: StartNew25!
*/

-- Clear existing test data to avoid conflicts
TRUNCATE TABLE ai_insights CASCADE;
TRUNCATE TABLE hr_interactions CASCADE;
TRUNCATE TABLE transcripts CASCADE;
TRUNCATE TABLE cases CASCADE;
TRUNCATE TABLE hr_users CASCADE;

-- Insert comprehensive HR users for testing
INSERT INTO hr_users (name, email, role, department) VALUES
  ('Sarah Johnson', 'hr@company.com', 'hr_manager', 'Human Resources'),
  ('Michael Chen', 'admin@company.com', 'hr_admin', 'Human Resources'),
  ('Emily Rodriguez', 'test@company.com', 'hr_specialist', 'Employee Relations'),
  ('David Kim', 'manager@company.com', 'hr_manager', 'Human Resources'),
  ('Lisa Wang', 'specialist@company.com', 'hr_specialist', 'Employee Relations');

-- Insert comprehensive test cases with realistic scenarios
INSERT INTO cases (confirmation_code, category, summary, severity, status, created_at, updated_at) VALUES
  -- High priority safety case - TESTING
  ('AB7X9K2M4P', 'Workplace Safety', 'Employee reported serious safety concerns about unmaintained equipment in manufacturing. Multiple near-miss incidents documented. Immediate safety audit required to prevent potential accidents.', 4, 'investigating', '2025-01-26T10:30:00Z', '2025-01-27T14:15:00Z'),
  
  -- Harassment case - TESTING  
  ('CD8Y5N3Q1R', 'Harassment', 'Report of inappropriate behavior and discriminatory comments from supervisor. Creating hostile work environment affecting multiple team members. Witnesses available for statements.', 4, 'open', '2025-01-26T09:15:00Z', '2025-01-26T09:15:00Z'),
  
  -- Policy violation - RESOLVED
  ('EF9Z6P4S2T', 'Policy Violation', 'Inconsistent break time policy enforcement causing unfair work distribution. Some employees taking extended breaks while others cover responsibilities. Management training completed.', 2, 'closed', '2025-01-25T15:45:00Z', '2025-01-27T08:30:00Z'),
  
  -- Critical discrimination case - URGENT
  ('GH1A7R5U3V', 'Discrimination', 'Systematic discriminatory hiring practices observed. Pattern of bias in promotion decisions based on gender and age. Legal compliance review initiated immediately.', 5, 'investigating', '2025-01-25T11:20:00Z', '2025-01-27T13:45:00Z'),
  
  -- Communication issues - NEW
  ('JK2B8S6W4X', 'Workplace Environment', 'Poor interdepartmental communication causing project delays and employee frustration. Information sharing gaps affecting team morale and productivity.', 3, 'open', '2025-01-25T14:30:00Z', '2025-01-25T14:30:00Z'),
  
  -- Benefits inquiry - RESOLVED
  ('LM3C9T7Y5Z', 'Benefits Inquiry', 'Employee questions about recent health insurance changes and retirement plan updates. Comprehensive information provided and case resolved successfully.', 1, 'closed', '2025-01-24T16:20:00Z', '2025-01-25T10:15:00Z'),
  
  -- Recent safety case - URGENT
  ('NP4D1U8Z6A', 'Workplace Safety', 'Inadequate safety training for new equipment installation. Missing protective gear and safety protocols. Immediate training scheduled to prevent injuries.', 4, 'investigating', '2025-01-24T13:45:00Z', '2025-01-27T11:30:00Z'),
  
  -- Work-life balance - ACTIVE
  ('QR5E2V9A7B', 'Work-Life Balance', 'Excessive mandatory overtime affecting employee health and family relationships. Request for review of scheduling practices and better work-life balance policies.', 3, 'open', '2025-01-24T12:10:00Z', '2025-01-24T12:10:00Z'),
  
  -- New harassment case - TODAY
  ('ST6F3W1Y8C', 'Harassment', 'Inappropriate comments and behavior from team lead during meetings. Multiple team members affected. Immediate investigation required with witness interviews.', 4, 'open', '2025-01-27T09:30:00Z', '2025-01-27T09:30:00Z'),
  
  -- Environment concern - TODAY  
  ('UV7G4X2Z9D', 'Workplace Environment', 'Poor ventilation and lighting affecting employee health and productivity. Multiple complaints about headaches and eye strain. Facility improvements needed.', 2, 'open', '2025-01-27T11:45:00Z', '2025-01-27T11:45:00Z'),
  
  -- Management issue - RECENT
  ('WX8H5Y3A1E', 'Policy Violation', 'Manager double standards in attendance policy enforcement. Late arrivals ignored while strict rules enforced for team members. Team morale affected.', 3, 'investigating', '2025-01-27T13:20:00Z', '2025-01-27T15:10:00Z'),
  
  -- Latest discrimination case - TODAY
  ('YZ9I6Z4B2F', 'Discrimination', 'Qualified female candidates consistently passed over for promotions. Pattern suggests gender bias in advancement decisions. Urgent investigation required.', 5, 'investigating', '2025-01-27T14:15:00Z', '2025-01-27T16:30:00Z');

-- Insert realistic transcripts for each case (full conversation examples)
INSERT INTO transcripts (case_id, raw_transcript, processed_summary, sentiment_score) 
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'I need to report serious safety concerns in our manufacturing department. The equipment hasnt been properly maintained for months and there have been several near-miss incidents that management isnt documenting properly. Just last week, the conveyor belt malfunctioned and almost caught someones clothing. The safety guards are loose and some are missing entirely. Im really worried someone is going to get seriously hurt if we dont address this immediately. When we bring these concerns up in safety meetings, management just says theyll look into it but nothing ever changes. We need proper equipment maintenance and documented safety procedures.'
    WHEN 'CD8Y5N3Q1R' THEN 'I need to report my supervisor for inappropriate behavior and harassment. He has been making inappropriate comments about my appearance and other female employees appearances. He also makes discriminatory remarks about our capabilities and assigns us less important tasks compared to male colleagues. This has been going on for about three months now and its creating a really hostile work environment. Other team members have noticed it too but theyre afraid to speak up because hes in charge of performance reviews. I dread coming to work every day and its seriously affecting my mental health and job performance.'
    WHEN 'EF9Z6P4S2T' THEN 'I want to bring up concerns about break time policies not being enforced fairly across the team. Some employees regularly take 30 to 45 minute breaks when theyre supposed to be 15 minutes, while others stick to the rules. The people taking longer breaks happen to be friends with the supervisor so nothing gets said to them. Meanwhile, those of us following the rules have to cover their work and pick up the slack. Its creating a lot of resentment and unfairness in the team. Management needs to either enforce the policy consistently for everyone or change it.'
    WHEN 'GH1A7R5U3V' THEN 'I believe there are serious discriminatory hiring practices happening in our department and I think the company needs to investigate this immediately. Over the past year, Ive observed a clear pattern where qualified female and older candidates are being passed over for positions and promotions in favor of younger male candidates with less experience and fewer qualifications. In the last three hiring rounds, despite having strong female candidates who interviewed well and had better credentials, they chose men every time. The same thing is happening with promotions. I think were violating equal opportunity employment laws.'
    WHEN 'JK2B8S6W4X' THEN 'There are serious communication problems between departments that are causing major project delays and a lot of frustration among staff. Information isnt being shared properly between teams, deadlines are being missed because nobody knows what the other departments are doing, and were constantly duplicating work or working at cross purposes. The lack of coordination is really affecting morale and our ability to deliver quality work on time. We need better communication systems and regular interdepartmental meetings to keep everyone informed and on the same page.'
    WHEN 'LM3C9T7Y5Z' THEN 'I have questions about the recent changes to our health insurance and retirement benefits package. The information that was sent out was really confusing and I need clarification on how these changes affect my current coverage and what my options are for enrollment. Specifically, I need to understand the new deductible amounts, what doctors are still covered under the new plan, and how the retirement matching percentage has changed. Can someone from HR help explain these changes in plain language and walk me through my options?'
    WHEN 'NP4D1U8Z6A' THEN 'Im very concerned about the safety training for the new equipment that was installed in our department last month. The training session was only two hours long and didnt cover all the safety protocols properly. We also dont have the right protective equipment - the safety goggles dont fit properly and some of the machine guards are missing. This equipment is dangerous and I think someone could get seriously injured if we dont get proper comprehensive training and the right safety equipment. We shouldnt be using this equipment until these safety issues are resolved.'
    WHEN 'QR5E2V9A7B' THEN 'The excessive overtime requirements are really affecting my work-life balance and my physical and mental health. For the past two months, weve been required to work mandatory overtime almost every week, sometimes 12-hour days and even weekends. Its affecting my family time, my sleep schedule, and my overall well-being. I understand that sometimes overtime is necessary for urgent projects, but this has become the norm rather than the exception. I think we need to review our staffing levels and scheduling practices to find a better balance.'
    WHEN 'ST6F3W1Y8C' THEN 'I need to report inappropriate behavior from our team lead during meetings and daily interactions. He makes comments about peoples appearance, especially the women on the team, and makes jokes that make people uncomfortable. He also has a habit of interrupting women when theyre speaking and dismissing their ideas, but he listens respectfully when men speak. Several of us have noticed this pattern and its creating a really uncomfortable work environment. Some team members have started avoiding meetings or speaking up because of his behavior.'
    WHEN 'UV7G4X2Z9D' THEN 'I want to report concerns about our workspace conditions that are affecting employee health and productivity. The ventilation system in our area hasnt been working properly for weeks - its stuffy and the air feels stale. The lighting is also inadequate, with several fluorescent bulbs burned out and not replaced. Multiple people have complained about headaches and eye strain. These conditions are making it hard to concentrate and do our jobs effectively. We need facilities management to address these issues as soon as possible.'
    WHEN 'WX8H5Y3A1E' THEN 'I want to report a double standard with attendance policies. Our manager consistently arrives 30 to 45 minutes late and leaves early, but enforces very strict attendance rules for the rest of the team. If any of us are even 10 minutes late, we get written up, but nothing is ever said about his tardiness. He also takes long lunches and personal calls during work hours. This is creating a lot of resentment in the team because we feel like there are different rules for management versus regular employees.'
    WHEN 'YZ9I6Z4B2F' THEN 'I believe there is gender discrimination happening in our promotion and advancement processes. Over the past 18 months, Ive watched several highly qualified women get passed over for promotions and leadership roles in favor of men with less experience and qualifications. In my own case, I was told I needed more experience, but then they promoted a male colleague who started after me and has fewer certifications. This pattern is happening across multiple departments and I think it needs to be investigated immediately.'
  END,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'Manufacturing safety concerns: unmaintained equipment, near-miss incidents, loose safety guards. Employee reports management inaction on safety meeting concerns. Immediate equipment maintenance and safety procedure documentation required.'
    WHEN 'CD8Y5N3Q1R' THEN 'Supervisor harassment: inappropriate appearance comments, discriminatory task assignments affecting female employees. 3-month pattern creating hostile environment. Performance review concerns preventing colleague reports.'
    WHEN 'EF9Z6P4S2T' THEN 'Inconsistent break policy enforcement: 15-minute breaks extended to 30-45 minutes by supervisor favorites. Rule-following employees covering extra work. Team resentment and unfairness requiring management intervention.'
    WHEN 'GH1A7R5U3V' THEN 'Systematic hiring discrimination: qualified female/older candidates passed over for younger males with less experience. Year-long pattern across multiple hiring rounds. Potential EEOC violations requiring investigation.'
    WHEN 'JK2B8S6W4X' THEN 'Interdepartmental communication breakdown: poor information sharing causing project delays, work duplication, missed deadlines. Staff frustration affecting morale and work quality. Coordination systems needed.'
    WHEN 'LM3C9T7Y5Z' THEN 'Benefits clarification request: health insurance and retirement plan changes. Employee needs plain-language explanation of deductibles, doctor coverage, retirement matching changes.'
    WHEN 'NP4D1U8Z6A' THEN 'New equipment safety deficiencies: inadequate 2-hour training, improper protective equipment, missing machine guards. Dangerous conditions requiring immediate training and safety equipment before continued use.'
    WHEN 'QR5E2V9A7B' THEN 'Excessive mandatory overtime: 2-month pattern of 12-hour days and weekends affecting work-life balance, health, family time, sleep. Staffing and scheduling review needed for better balance.'
    WHEN 'ST6F3W1Y8C' THEN 'Team lead inappropriate behavior: appearance comments toward women, uncomfortable jokes, interrupting/dismissing female team members while respecting male colleagues. Pattern creating uncomfortable environment.'
    WHEN 'UV7G4X2Z9D' THEN 'Workspace health hazards: malfunctioning ventilation causing stuffy air, inadequate lighting with burned-out bulbs. Multiple employee complaints of headaches, eye strain affecting concentration and productivity.'
    WHEN 'WX8H5Y3A1E' THEN 'Manager attendance double standard: 30-45 minute late arrivals and early departures while strictly enforcing punctuality for team. Long personal lunches and calls creating resentment over unequal rule application.'
    WHEN 'YZ9I6Z4B2F' THEN 'Gender discrimination in promotions: 18-month pattern of qualified women passed over for less experienced men. Personal example of male colleague with less experience promoted instead. Cross-departmental pattern requiring investigation.'
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
  'Thank you for your feedback report. We have received your concerns and assigned them to our HR team for immediate review. Your case has been assigned confirmation code ' || c.confirmation_code || ' for tracking. We take all employee feedback seriously and will keep you updated on our investigation progress. Please save this confirmation code for future reference.',
  'system',
  'HR System',
  c.created_at + INTERVAL '5 minutes'
FROM cases c;

-- Add detailed follow-up messages for investigating cases
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'We have initiated a comprehensive safety investigation led by our certified safety officer. The equipment assessment is scheduled for tomorrow morning, and we are reviewing all incident documentation from the past 6 months. Interviews with department personnel will begin this week. As a precautionary measure, we are implementing immediate safety protocols and scheduling equipment maintenance. We expect to have an initial safety report within 48 hours.'
    WHEN 'GH1A7R5U3V' THEN 'Your discrimination report is being thoroughly investigated by our compliance team in consultation with our legal department. We are conducting a comprehensive review of all hiring and promotion records from the past 18 months. Confidential interviews with relevant personnel will begin immediately. This matter is being treated with the highest priority to ensure full compliance with equal opportunity employment laws. We will provide updates weekly during the investigation.'
    WHEN 'NP4D1U8Z6A' THEN 'IMMEDIATE ACTION: We are suspending use of the new equipment until comprehensive safety training and proper protective equipment are provided. Our safety team is scheduling mandatory training sessions for all operators this week. We have ordered appropriate protective equipment and will conduct equipment safety inspections. No employee should operate this equipment until cleared by our safety officer. Your safety is our absolute top priority.'
    WHEN 'WX8H5Y3A1E' THEN 'We are investigating the attendance policy concerns you raised. Our HR director will be reviewing attendance records for the past 3 months and scheduling a meeting with the department manager this week. All employees, regardless of position, are expected to follow company policies consistently. We will ensure fair and equitable application of all workplace policies and address any inconsistencies immediately.'
    WHEN 'YZ9I6Z4B2F' THEN 'Your concerns about potential gender discrimination in promotions are being investigated by our HR compliance team with legal oversight. We are conducting a comprehensive audit of all promotion decisions over the past 18 months, including evaluation criteria and decision-making processes. We are committed to ensuring equal opportunities for all employees and will take immediate corrective action if any bias is identified.'
  END,
  'hr_manager',
  'Sarah Johnson',
  c.updated_at
FROM cases c 
WHERE c.status = 'investigating';

-- Add closure messages for resolved cases
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'EF9Z6P4S2T' THEN 'CASE RESOLVED: We have addressed the break time policy concerns with department management and implemented a new monitoring system. All employees have been reminded of proper break time procedures, and supervisors have received training on consistent policy enforcement. We have established a clear escalation process for policy violations. Thank you for bringing this important issue to our attention. The new procedures are now in effect.'
    WHEN 'LM3C9T7Y5Z' THEN 'INFORMATION PROVIDED: We have sent you detailed information about the benefits changes via email, including a comprehensive comparison chart and FAQ document. Our benefits coordinator has also scheduled a one-on-one consultation to review your specific situation. Your case has been resolved, but please feel free to contact us if you have any additional questions about your benefits or need further clarification.'
  END,
  'hr_manager',
  'Sarah Johnson',
  c.updated_at
FROM cases c 
WHERE c.status = 'closed';

-- Add employee responses to show two-way communication
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'Thank you for the quick response and immediate action. I wanted to add that there was another incident yesterday where the emergency stop button on machine #3 didnt work properly. The operator had to manually shut down the machine. I think this should be part of your safety investigation. Also, two other employees have mentioned similar concerns about the equipment maintenance.'
    WHEN 'CD8Y5N3Q1R' THEN 'I appreciate that this is being taken seriously. I have documented several specific incidents with dates and times. There are also two other female employees who witnessed some of these inappropriate comments and are willing to provide statements if needed for the investigation. I can provide all documentation to support the case.'
    WHEN 'GH1A7R5U3V' THEN 'Thank you for investigating this important issue. I have additional documentation including job postings, interview feedback forms, and promotion announcements that clearly show the pattern I mentioned. I can provide these documents and contact information for other affected employees to support the investigation. This is affecting multiple people.'
    WHEN 'ST6F3W1Y8C' THEN 'I am glad this is being addressed. Three other team members have also experienced similar behavior and are willing to discuss their experiences. The most recent incident was during last Tuesdays team meeting when he made inappropriate comments about a colleagues presentation style. We have all been documenting these incidents.'
  END,
  'employee',
  'Anonymous Employee',
  c.updated_at + INTERVAL '2 hours'
FROM cases c 
WHERE c.confirmation_code IN ('AB7X9K2M4P', 'CD8Y5N3Q1R', 'GH1A7R5U3V', 'ST6F3W1Y8C');

-- Insert comprehensive AI insights for risk assessment
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'risk_assessment',
  jsonb_build_object(
    'risk_level', c.severity,
    'risk_factors', CASE 
      WHEN c.category = 'Workplace Safety' THEN ARRAY['Physical injury potential', 'OSHA compliance', 'Equipment liability', 'Regulatory violations', 'Worker compensation claims']
      WHEN c.category = 'Harassment' THEN ARRAY['Legal liability', 'Hostile workplace claims', 'Employee retention', 'Company reputation', 'EEOC violations']
      WHEN c.category = 'Discrimination' THEN ARRAY['Federal law violations', 'Class action risk', 'EEOC compliance', 'Legal penalties', 'Reputation damage']
      WHEN c.category = 'Policy Violation' THEN ARRAY['Management credibility', 'Employee fairness', 'Operational efficiency', 'Team morale impact']
      WHEN c.category = 'Work-Life Balance' THEN ARRAY['Employee burnout', 'Turnover risk', 'Productivity decline', 'Health insurance claims']
      WHEN c.category = 'Workplace Environment' THEN ARRAY['Employee satisfaction', 'Health violations', 'Productivity impact', 'Facility compliance']
      ELSE ARRAY['General workplace concern', 'Employee relations impact']
    END,
    'immediate_action_required', c.severity >= 4,
    'estimated_impact', CASE 
      WHEN c.severity >= 4 THEN 'High - Immediate attention required'
      WHEN c.severity >= 3 THEN 'Medium - Address within week'
      ELSE 'Low - Standard processing'
    END,
    'legal_risk_level', CASE
      WHEN c.category IN ('Discrimination', 'Harassment') THEN 'High - Legal consultation recommended'
      WHEN c.category = 'Workplace Safety' THEN 'Medium - Compliance review needed'
      ELSE 'Low - Internal resolution'
    END,
    'financial_impact', CASE
      WHEN c.severity >= 4 THEN 'Potential significant costs if unresolved'
      WHEN c.severity >= 3 THEN 'Moderate costs possible'
      ELSE 'Low financial impact expected'
    END
  ),
  0.89
FROM cases c;

-- Insert detailed next steps recommendations
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'next_steps',
  jsonb_build_object(
    'immediate_actions', CASE c.category
      WHEN 'Workplace Safety' THEN ARRAY['Conduct immediate equipment safety audit', 'Document all safety incidents', 'Interview affected employees', 'Review maintenance logs', 'Implement temporary safety measures', 'Schedule OSHA compliance review']
      WHEN 'Harassment' THEN ARRAY['Interview complainant confidentially', 'Interview accused party', 'Interview all witnesses', 'Review company harassment policies', 'Document all interactions', 'Consider temporary workplace adjustments']
      WHEN 'Discrimination' THEN ARRAY['Legal consultation immediate', 'Comprehensive hiring record review', 'Interview all hiring managers', 'Audit promotion processes', 'Review job descriptions for bias', 'Implement bias training']
      WHEN 'Policy Violation' THEN ARRAY['Management training scheduled', 'Policy review and clarification', 'Implement monitoring system', 'Team meeting for expectations', 'Document policy enforcement']
      WHEN 'Work-Life Balance' THEN ARRAY['Staffing level analysis', 'Overtime pattern review', 'Employee wellness check', 'Schedule flexibility assessment', 'Workload distribution audit']
      ELSE ARRAY['Thorough investigation', 'Employee interviews', 'Document all findings', 'Develop action plan', 'Regular follow-up scheduled']
    END,
    'recommended_timeline', CASE 
      WHEN c.severity >= 4 THEN '24-48 hours for initial response, full resolution within 2 weeks'
      WHEN c.severity >= 3 THEN '3-5 business days for initial response, resolution within 3 weeks'
      ELSE '1 week for initial response, resolution within 1 month'
    END,
    'priority_level', CASE 
      WHEN c.severity >= 4 THEN 'URGENT - Escalate to senior management'
      WHEN c.severity >= 3 THEN 'HIGH - Department manager involvement required'
      ELSE 'NORMAL - Standard HR processing'
    END,
    'estimated_resolution_time', CASE
      WHEN c.category IN ('Discrimination', 'Harassment') THEN '2-6 weeks with legal consultation'
      WHEN c.category = 'Workplace Safety' THEN '1-3 weeks with safety compliance'
      ELSE '1-2 weeks with standard processing'
    END,
    'follow_up_schedule', ARRAY['48-hour initial update', 'Weekly progress reports', 'Resolution confirmation', '30-day effectiveness review'],
    'required_approvals', CASE
      WHEN c.severity >= 4 THEN ARRAY['HR Director', 'Legal Department', 'Senior Management']
      WHEN c.severity >= 3 THEN ARRAY['HR Manager', 'Department Head']
      ELSE ARRAY['HR Specialist']
    END
  ),
  0.85
FROM cases c;

-- Insert sentiment and emotional analysis
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'sentiment_analysis',
  jsonb_build_object(
    'overall_sentiment', CASE 
      WHEN t.sentiment_score <= -0.6 THEN 'Very Negative - High distress'
      WHEN t.sentiment_score <= -0.4 THEN 'Negative - Significant concern'
      WHEN t.sentiment_score <= -0.2 THEN 'Somewhat Negative - Mild concern'
      WHEN t.sentiment_score <= 0.1 THEN 'Neutral - Professional tone'
      ELSE 'Positive - Constructive feedback'
    END,
    'sentiment_score', t.sentiment_score,
    'emotional_indicators', CASE 
      WHEN t.sentiment_score <= -0.6 THEN ARRAY['High frustration', 'Anger', 'Distress', 'Fear for safety', 'Anxiety about retaliation']
      WHEN t.sentiment_score <= -0.4 THEN ARRAY['Frustration', 'Concern', 'Worry', 'Disappointment', 'Job stress']
      WHEN t.sentiment_score <= -0.2 THEN ARRAY['Mild concern', 'Professional worry', 'Dissatisfaction', 'Hope for resolution']
      ELSE ARRAY['Professional tone', 'Constructive approach', 'Solution-focused', 'Calm demeanor']
    END,
    'urgency_indicators', CASE 
      WHEN t.sentiment_score <= -0.6 THEN ARRAY['Immediate intervention needed', 'High stress levels', 'Potential resignation risk']
      WHEN t.sentiment_score <= -0.4 THEN ARRAY['Prompt attention required', 'Monitor employee wellbeing', 'Escalation potential']
      ELSE ARRAY['Standard processing appropriate', 'Low escalation risk']
    END,
    'employee_support_needed', CASE
      WHEN t.sentiment_score <= -0.6 THEN 'HIGH - Consider EAP referral, regular check-ins, immediate manager discussion'
      WHEN t.sentiment_score <= -0.4 THEN 'MEDIUM - Weekly check-ins, monitor stress levels, ensure support available'
      ELSE 'STANDARD - Regular follow-up, standard support resources'
    END,
    'communication_style', CASE
      WHEN t.sentiment_score <= -0.4 THEN 'Empathetic, immediate response, acknowledge concerns, provide clear timeline'
      ELSE 'Professional, timely response, clear process explanation, regular updates'
    END
  ),
  0.91
FROM cases c
JOIN transcripts t ON c.id = t.case_id;

-- Insert similar cases pattern analysis
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'similar_cases',
  jsonb_build_object(
    'similar_cases_6_months', (
      SELECT COUNT(*) 
      FROM cases c2 
      WHERE c2.category = c.category 
      AND c2.id != c.id 
      AND c2.created_at >= CURRENT_DATE - INTERVAL '6 months'
    ),
    'pattern_analysis', CASE c.category
      WHEN 'Workplace Safety' THEN 'CRITICAL PATTERN: Multiple safety incidents indicate systemic issues requiring immediate safety culture review and equipment audit'
      WHEN 'Harassment' THEN 'CONCERNING PATTERN: Multiple harassment reports suggest need for comprehensive culture assessment and management training'
      WHEN 'Discrimination' THEN 'LEGAL RISK PATTERN: Discrimination complaints across departments require immediate legal consultation and policy review'
      WHEN 'Policy Violation' THEN 'MANAGEMENT PATTERN: Policy enforcement inconsistencies suggest need for management training and clear guidelines'
      ELSE 'STANDARD PATTERN: Normal workplace feedback requiring standard processing and documentation'
    END,
    'trend_severity', CASE 
      WHEN c.category IN ('Workplace Safety', 'Harassment', 'Discrimination') THEN 'HIGH - Systemic review required'
      WHEN c.category IN ('Policy Violation', 'Work-Life Balance') THEN 'MEDIUM - Management attention needed'
      ELSE 'LOW - Individual case processing'
    END,
    'preventive_measures', CASE c.category
      WHEN 'Workplace Safety' THEN ARRAY['Monthly safety audits', 'Enhanced safety training program', 'Equipment maintenance scheduling', 'Safety culture workshops', 'Anonymous safety reporting system']
      WHEN 'Harassment' THEN ARRAY['Mandatory harassment prevention training', 'Clear reporting procedures', 'Regular culture surveys', 'Management accountability training', 'Bystander intervention training']
      WHEN 'Discrimination' THEN ARRAY['Unconscious bias training for all managers', 'Diverse hiring panels', 'Regular equity audits', 'Mentorship programs', 'Clear advancement criteria']
      WHEN 'Policy Violation' THEN ARRAY['Management consistency training', 'Policy clarification sessions', 'Regular policy reviews', 'Employee feedback channels', 'Fair enforcement monitoring']
      ELSE ARRAY['Regular employee satisfaction surveys', 'Open communication channels', 'Management training', 'Employee recognition programs']
    END,
    'department_impact', CASE
      WHEN c.category IN ('Workplace Safety', 'Discrimination') THEN 'Company-wide review recommended'
      WHEN c.category IN ('Harassment', 'Policy Violation') THEN 'Department-specific intervention needed'
      ELSE 'Localized issue with standard resolution'
    END,
    'recommended_training', CASE c.category
      WHEN 'Workplace Safety' THEN 'Comprehensive safety training and certification program'
      WHEN 'Harassment' THEN 'Respect in workplace and harassment prevention training'
      WHEN 'Discrimination' THEN 'Diversity, equity, and inclusion training program'
      ELSE 'Standard workplace communication and policy training'
    END
  ),
  0.78
FROM cases c;

-- Verify comprehensive data insertion
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
  
  RAISE NOTICE 'Comprehensive test data insertion completed:';
  RAISE NOTICE '- Cases with realistic scenarios: %', case_count;
  RAISE NOTICE '- Full conversation transcripts: %', transcript_count;
  RAISE NOTICE '- HR interactions and responses: %', interaction_count;
  RAISE NOTICE '- AI insights and analysis: %', insight_count;
  RAISE NOTICE '- HR users for testing: %', hr_user_count;
  
  IF case_count < 12 THEN
    RAISE EXCEPTION 'Test data insertion incomplete - expected 12+ cases, got %', case_count;
  END IF;
  
  RAISE NOTICE 'TEST CREDENTIALS:';
  RAISE NOTICE '- Email: hr@company.com, Password: demo123';
  RAISE NOTICE '- Email: admin@company.com, Password: admin123';
  RAISE NOTICE '- Email: test@company.com, Password: StartNew25!';
  RAISE NOTICE 'TEST CONFIRMATION CODES: AB7X9K2M4P, CD8Y5N3Q1R, EF9Z6P4S2T, GH1A7R5U3V';
END $$;