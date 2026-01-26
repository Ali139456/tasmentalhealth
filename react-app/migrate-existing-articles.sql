-- Migration script to add existing 6 articles to the resources table
-- Run this in Supabase SQL Editor

-- Article 1: How to Choose the Right Mental Health Professional in Tasmania
INSERT INTO resources (title, slug, category, content, excerpt, image_url, tags, read_time, published)
VALUES (
  'How to Choose the Right Mental Health Professional in Tasmania',
  'choosing-professional',
  'For People Seeking Support',
  'Finding the right mental health professional is one of the most important decisions you can make for your wellbeing. In Tasmania, you have access to a range of qualified professionals, each with different training, approaches, and specialisations. This guide will help you understand the differences between types of mental health professionals and how to find the right match for your needs.

Understanding Different Types of Professionals

Psychologists are trained in psychological assessment and therapy. They hold a minimum of 6 years of university training and are registered with the Psychology Board of Australia.

Psychiatrists are medical doctors who specialise in mental health. They can prescribe medication and provide therapy. They are registered with the Medical Board of Australia.

Counsellors provide talk therapy and support. They may have various qualifications and are often registered with professional bodies like the Australian Counselling Association.

What to Consider When Choosing

Consider the type of support you need. Are you looking for someone to help with a specific issue, or do you need ongoing support?

Think about the therapeutic approach. Some professionals use Cognitive Behavioural Therapy (CBT), while others may use Acceptance and Commitment Therapy (ACT), or other evidence-based approaches.

Location and availability matter. Do you prefer in-person sessions, or would telehealth work for you? Consider travel time and scheduling flexibility.',
  'Finding the right match is crucial for effective therapy. Understanding the difference between psychologists, psychiatrists, and counsellors is the first step.',
  '/images/resource-ocean.jpg',
  ARRAY['#Guide', '#Therapy', '#Beginners'],
  5,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Article 2: Why Mental Health Professionals Should List in Local Directories
INSERT INTO resources (title, slug, category, content, excerpt, image_url, tags, read_time, published)
VALUES (
  'Why Mental Health Professionals Should List in Local Directories',
  'listing-benefits',
  'For Professionals & Clinics',
  'Are you looking to grow your private practice in Hobart or expand your reach? Joining a dedicated mental health directory significantly boosts your local SEO. In the digital age, how clients find you has changed. Word of mouth is powerful, but Google is often the first place someone turns when they are struggling. Listing your practice in a reputable, local directory is a strategic move for several reasons.

1. Improved Local SEO

Search engines like Google prioritise local results. A listing on a Tasmanian-specific directory signals to Google that your practice is relevant to local searchers. This improves your ranking for terms like "Psychologist Hobart" or "Counselling Launceston". When potential clients search for mental health support in their area, your listing appears in local search results, making it easier for them to find you.

2. High-Intent Traffic

Visitors to a mental health directory are not browsing aimlessly; they are actively seeking help. This means the traffic directed to your website or profile is high-quality and more likely to convert into booked appointments. Unlike general advertising, directory listings connect you with people who are ready to take action and seek professional support.

3. Professional Credibility

Being listed alongside other verified professionals builds trust. It shows you are part of the established mental health community in Tasmania. Potential clients see that you are verified and part of a trusted network, which can be the deciding factor when choosing between providers.

4. Cost-Effective Marketing

Compared to Google Ads or print media, directory listings offer a high return on investment (ROI), providing year-round visibility for a fraction of the cost. A single directory listing can generate multiple referrals over time, making it one of the most cost-effective ways to market your practice.',
  'Are you looking to grow your private practice in Hobart or expand your reach? Joining a dedicated mental health directory significantly boosts your local SEO.',
  '/images/resource-forest.jpg',
  ARRAY['#Marketing', '#Private Practice', '#SEO'],
  8,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Article 3: Understanding Medicare Rebates & Mental Health Care Plans
INSERT INTO resources (title, slug, category, content, excerpt, image_url, tags, read_time, published)
VALUES (
  'Understanding Medicare Rebates & Mental Health Care Plans',
  'medicare-rebates',
  'For People Seeking Support',
  'Navigating the costs of therapy can be confusing. This guide explains how the Better Access initiative works and how to get a Mental Health Treatment Plan from your GP. Medicare provides rebates for mental health services through the Better Access to Mental Health Care initiative, making professional support more affordable for many Australians.

What is a Mental Health Treatment Plan?

A Mental Health Treatment Plan (MHTP) is a document created by your GP that outlines your mental health goals and the treatment you will receive. To be eligible, you need to see your GP for an assessment. They will determine if you meet the criteria for a MHTP, which typically includes experiencing a mental health condition that significantly impacts your daily life.

How Much Can You Claim?

With a valid MHTP, you can claim Medicare rebates for up to 10 individual sessions per calendar year with a psychologist, social worker, or occupational therapist. You can also access up to 10 group therapy sessions. The rebate amount varies depending on the type of professional and session length, typically ranging from $87.45 to $131.65 per session.

Getting Started

Step 1: Book an appointment with your GP to discuss your mental health concerns.
Step 2: Your GP will assess your needs and create a Mental Health Treatment Plan if appropriate.
Step 3: Your GP will provide you with a referral to see a mental health professional.
Step 4: Book an appointment with the referred professional and bring your referral and Medicare card.
Step 5: Claim your rebate after each session, either on the spot if the practice offers electronic claiming, or through Medicare later.',
  'Navigating the costs of therapy can be confusing. This guide explains how the Better Access initiative works and how to get a Mental Health Treatment Plan from your GP.',
  '/images/resource-medicare-new.jpeg',
  ARRAY['#Medicare', '#Finance', '#Access'],
  6,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Article 4: Tips for Supporting a Loved One with Anxiety
INSERT INTO resources (title, slug, category, content, excerpt, image_url, tags, read_time, published)
VALUES (
  'Tips for Supporting a Loved One with Anxiety',
  'supporting-anxiety',
  'For Families & Carers',
  'It can be hard to know what to say when someone you care about is struggling with anxiety. Here are practical, compassionate ways to offer support without taking over. Supporting someone with anxiety requires patience, understanding, and knowing when to step in versus when to give space.

What to Say (and What Not to Say)

Helpful phrases: "I''m here for you," "This must be really difficult," "Would you like to talk about it?"

Avoid saying: "Just relax," "Don''t worry about it," "You''re overreacting." These phrases can make someone feel dismissed or misunderstood. Instead, validate their feelings and let them know their experience is real and valid.

Practical Ways to Help

Offer to accompany them to appointments or therapy sessions if they want support. Help with daily tasks that might feel overwhelming when anxiety is high. Learn about anxiety together - understanding the condition can help you provide better support. Encourage professional help when appropriate, but don''t force it.

Taking Care of Yourself

Supporting someone with anxiety can be emotionally draining. Make sure you''re also taking care of your own mental health. Set boundaries and know your limits. You can''t pour from an empty cup. Consider seeking support for yourself, whether through friends, family, or professional counselling.',
  'It can be hard to know what to say when someone you care about is struggling. Here are practical, compassionate ways to offer support without taking over.',
  '/photo-1573497019940-1c28c88b4f3e.jpeg',
  ARRAY['#Anxiety', '#Family', '#Support'],
  5,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Article 5: Telehealth vs In-Person Therapy: What''s Right for You?
INSERT INTO resources (title, slug, category, content, excerpt, image_url, tags, read_time, published)
VALUES (
  'Telehealth vs In-Person Therapy: What''s Right for You?',
  'telehealth-vs-inperson',
  'For People Seeking Support',
  'With the rise of digital health, you now have more choices when it comes to accessing mental health support. We compare the benefits of online counselling versus traditional face-to-face sessions. Both telehealth and in-person therapy have their advantages, and the best choice depends on your individual needs, preferences, and circumstances.

Benefits of Telehealth

Convenience: Access therapy from the comfort of your own home, eliminating travel time and costs. Accessibility: Particularly valuable for those in rural or remote areas, or people with mobility issues. Flexibility: Often easier to fit into busy schedules. Comfort: Some people feel more comfortable opening up in their own space. Continuity: Can continue sessions even when travelling or during illness.

Benefits of In-Person Therapy

Personal connection: Some people find face-to-face interaction more meaningful and easier to read. Fewer distractions: A dedicated therapy space can help you focus. Non-verbal cues: Therapists can better observe body language and other non-verbal signals. Privacy: No concerns about internet connection or technology issues. Ritual: The act of going to therapy can be part of the therapeutic process itself.

Making the Right Choice

Consider your personal preferences, lifestyle, and what makes you feel most comfortable. Many therapists offer both options, so you might be able to try both and see what works best for you. Some issues may be better suited to in-person therapy, while others work well via telehealth. Discuss this with your therapist.',
  'With the rise of digital health, you now have more choices. We compare the benefits of online counselling versus traditional face-to-face sessions.',
  '/images/resource-telehealth-new.jpeg',
  ARRAY['#Telehealth', '#Technology', '#Access'],
  5,
  true
) ON CONFLICT (slug) DO NOTHING;

-- Article 6: Workplace Mental Health: A Guide for Tasmanian Employers
INSERT INTO resources (title, slug, category, content, excerpt, image_url, tags, read_time, published)
VALUES (
  'Workplace Mental Health: A Guide for Tasmanian Employers',
  'workplace-wellbeing',
  'For Professionals & Employers',
  'Creating a psychologically safe workplace is not just a legal requirement, it''s good business. Strategies for supporting your team''s mental wellbeing. Mental health in the workplace affects productivity, employee retention, and overall business success. As an employer in Tasmania, you have both legal and ethical responsibilities to support your team''s mental health.

Legal Requirements

Under Australian work health and safety laws, employers have a duty of care to protect workers from both physical and psychological harm. This includes identifying and managing psychosocial hazards such as excessive workload, bullying, harassment, and poor work-life balance. Failing to address mental health risks can result in legal consequences and significant costs to your business.

Creating a Psychologically Safe Workplace

Promote open communication: Encourage employees to speak up about concerns without fear of retribution. Provide training: Educate managers and staff about mental health, recognising signs of distress, and how to offer support. Review workloads: Ensure employees have manageable workloads and realistic deadlines. Support work-life balance: Encourage taking breaks, using leave, and maintaining boundaries. Offer resources: Provide access to Employee Assistance Programs (EAP) or mental health resources.

Benefits for Your Business

Improved productivity: Employees who feel supported are more engaged and productive. Reduced absenteeism: Better mental health support leads to fewer sick days. Better retention: Employees are more likely to stay with employers who care about their wellbeing. Enhanced reputation: Being known as a mental health-friendly employer helps attract top talent. Lower costs: Preventing mental health issues is more cost-effective than dealing with the consequences.',
  'Creating a psychologically safe workplace is not just a legal requirement, it''s good business. Strategies for supporting your team''s mental wellbeing.',
  '/photo-1522071820081-009f0129c71c.jpeg',
  ARRAY['#Workplace', '#Business', '#Wellbeing'],
  7,
  true
) ON CONFLICT (slug) DO NOTHING;
