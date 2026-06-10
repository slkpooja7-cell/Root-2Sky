// Goal tracker script: supports short-term & long-term goals, deadlines, complete, delete, and persistence
const STORAGE_KEY = 'root2sky_goals_v2';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('goalForm');
    if (form) form.addEventListener('submit', (e) => { e.preventDefault(); addGoal(); });
    renderGoals();
});

function getGoals() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { return []; }
}

function saveGoals(goals) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

function addGoal() {
    const goalInput = document.getElementById('goalInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const categorySelect = document.getElementById('categorySelect');
    if (!goalInput || !categorySelect) return;
    const text = goalInput.value.trim();
    const due = deadlineInput ? deadlineInput.value : '';
    const category = categorySelect.value || 'short';
    if (!text) return;
    const goals = getGoals();
    const id = Date.now().toString();
    goals.push({ id, text, due, done: false, category });
    saveGoals(goals);
    goalInput.value = '';
    if (deadlineInput) deadlineInput.value = '';
    renderGoals();
}

function renderGoals() {
    const shortList = document.getElementById('shortList');
    const longList = document.getElementById('longList');
    if (!shortList || !longList) return;
    const goals = getGoals();
    const short = goals.filter(g => g.category === 'short');
    const long = goals.filter(g => g.category === 'long');
    shortList.innerHTML = '';
    longList.innerHTML = '';
    if (short.length === 0) shortList.innerHTML = '<p class="empty">No short-term goals yet — add one! 🍂</p>';
    if (long.length === 0) longList.innerHTML = '<p class="empty">No long-term goals yet — add one! 🍁</p>';
    short.forEach(g => shortList.appendChild(createGoalNode(g)));
    long.forEach(g => longList.appendChild(createGoalNode(g)));
}

function createGoalNode(goal) {
    const li = document.createElement('li');
    li.className = 'goal-item' + (goal.done ? ' done' : '');
    li.dataset.id = goal.id;
    const emoji = goal.category === 'long' ? '🍁' : '🍂';
    li.innerHTML = `
        <span class="emoji">${emoji}</span>
        <div class="goal-main">
            <div class="goal-text">${escapeHtml(goal.text)}</div>
            <div class="goal-deadline">${goal.due ? 'Due: ' + formatDate(goal.due) : 'No deadline'}</div>
        </div>
        <div class="goal-actions">
            <button class="complete-btn" title="Toggle complete">${goal.done ? '↺' : '✅'}</button>
            <button class="delete-btn" title="Delete">🗑️</button>
        </div>
    `;
    li.querySelector('.complete-btn').addEventListener('click', () => toggleCompleteGoal(goal.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteGoal(goal.id));
    return li;
}

function toggleCompleteGoal(id) {
    const goals = getGoals();
    const g = goals.find(x => x.id === id);
    if (!g) return;
    g.done = !g.done;
    saveGoals(goals);
    renderGoals();
}

function deleteGoal(id) {
    let goals = getGoals();
    goals = goals.filter(x => x.id !== id);
    saveGoals(goals);
    renderGoals();
}

function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function getBotResponse(message) {
    message = message.toLowerCase().trim();

    // === ACADEMICS & STUDY ===
    if (message.match(/exam|test|quiz|final|midterm|paper|assignment|submit|grade|mark|score/)) {
        if (message.includes("stress") || message.includes("anxious") || message.includes("nervous")) {
            return "Exam stress is normal. Start preparing early, break topics into chunks, solve past papers, take regular breaks, and get good sleep before the exam. Staying organized beats cramming every time.";
        }
        if (message.includes("how") || message.includes("tips") || message.includes("strategy") || message.includes("prepare")) {
            return "Create a study schedule, identify important topics, practice with previous year papers, form study groups, and review regularly. Focus on understanding concepts, not just memorizing. Get 7-8 hours of sleep.";
        }
        return "Start early, don't cram. Practice previous papers, make notes, group study helps, and ask your professor if you're confused. You've got this!";
    }

    if (message.match(/semester|syllabus|course|subject|curriculum|lesson|class|lecture/)) {
        if (message.includes("choose") || message.includes("select")) {
            return "Pick courses based on your interests and career goals. Check what seniors say about professors, workload, and relevance. Balance core subjects with electives you enjoy.";
        }
        if (message.includes("manage") || message.includes("organize")) {
            return "Attend classes regularly, take notes actively, review within 24 hours, and don't skip lectures. Create a simple timetable, set reminders for assignments, and stay on top of deadlines.";
        }
        return "Your syllabus shows what you'll learn. Go to classes, complete assignments on time, ask questions, and maintain consistent notes. Review regularly for exams.";
    }

    if (message.match(/homework|assignment|project|submission|deadline|work|task|problem|research/)) {
        if (message.includes("late") || message.includes("miss")) {
            return "Contact your professor immediately, explain honestly, and ask for an extension. Next time, set reminders 2-3 days before deadlines and break work into smaller parts.";
        }
        if (message.includes("stuck") || message.includes("help") || message.includes("understand")) {
            return "Read the instructions carefully, break it into parts, try online resources or videos, ask classmates, and visit office hours. Your professor wants to help you succeed.";
        }
        return "Start early, understand what's asked, break it into parts, and submit before deadline. Quality beats rushing. Ask for help if stuck.";
    }

    if (message.match(/study|learn|focus|concentration|distraction|motivation/)) {
        if (message.includes("how")) {
            return "Find a quiet space, use the Pomodoro technique (25 min focus + 5 min break), keep your phone away, take notes while reading, and teach concepts to others. Active learning beats passive reading.";
        }
        if (message.includes("procrastinate")) {
            return "Break tasks into tiny steps, set a timer for just 10 minutes to start, remove distractions, reward yourself for progress, and study with a friend for accountability.";
        }
        return "Consistent study beats cramming. Study in short focused sessions, take breaks, stay hydrated, exercise, and get enough sleep. Your brain learns better when rested.";
    }

    if (message.match(/note|writing|document|organization|planner/)) {
        return "Use the Cornell method: divide pages into notes, cues, and summary. Use color-coding, highlight key points, write your own examples, and review notes regularly. Pick what keeps you consistent.";
    }

    // === PLACEMENTS & CAREER ===
    if (message.match(/placement|interview|job|internship|offer|recruit|hiring|career|role|position/)) {
        if (message.includes("prepare")) {
            return "Practice coding problems on LeetCode, learn your resume by heart, research the company, mock interview with seniors, and practice answering behavioral questions. Be clear, confident, and honest.";
        }
        if (message.includes("resume") || message.includes("cv")) {
            return "Keep it to 1 page. Add education, skills, projects with numbers/impact, internships, certifications, and achievements. Use action words, quantify results, and tailor for each role.";
        }
        if (message.includes("linked")) {
            return "Update your LinkedIn with a professional photo, strong headline, full experience, skills section, and recommendations. Share articles, engage with content, and build your network regularly.";
        }
        return "Build projects, solve coding problems, network with seniors, keep your resume updated, apply consistently, and practice interviews. You've got time to prepare!";
    }

    if (message.match(/data|science|ai|machine|analysis|statistics|python|sql|analytics/)) {
        return "Learn Python, SQL, statistics basics, then ML libraries like pandas and scikit-learn. Do projects with real datasets, participate in Kaggle, and follow analytics blogs. Practice is essential.";
    }

    if (message.match(/web|frontend|backend|react|node|javascript|development|full stack/)) {
        return "Start with HTML, CSS, JavaScript basics. Build projects, learn a framework (React/Vue), understand backend concepts, and deploy on GitHub. Build a portfolio with live projects.";
    }

    // === PERSONAL GROWTH & SKILLS ===
    if (message.match(/hobby|passion|interest|skill|course|certificate|language/)) {
        if (message.includes("time")) {
            return "Even 30 minutes daily helps. Start with one skill, practice consistently, set small milestones, and celebrate progress. Consistency beats intensity.";
        }
        if (message.includes("where")) {
            return "YouTube, Coursera, Udemy, LinkedIn Learning are great. Practice alongside learning. Join communities, contribute to projects, and build something real.";
        }
        return "Pick something genuinely interesting. Practice regularly, find a mentor, celebrate small wins, and build projects to showcase your skills.";
    }

    if (message.match(/leadership|presentation|public|speaking|communication|confident/)) {
        if (message.includes("fear") || message.includes("nervous")) {
            return "Everyone gets nervous. Practice multiple times, start with small groups, focus on your message, and remember the audience wants you to succeed.";
        }
        return "Join clubs, volunteer to present, practice public speaking in Toastmasters, record yourself, and seek feedback. Confidence comes from practice.";
    }

    if (message.match(/health|fitness|exercise|gym|yoga|sport|sleep|nutrition|diet/)) {
        return "Exercise 30 mins daily, eat balanced meals, sleep 7-8 hours, stay hydrated, and manage stress with meditation. A healthy body helps your mind and study performance.";
    }

    // === COLLEGE LIFE & SOCIAL ===
    if (message.match(/friend|friendship|social|lonely|introvert|conversation|meeting|network/)) {
        if (message.includes("shy") || message.includes("anxious")) {
            return "Take small steps: smile, ask questions, join clubs, attend events. You don't need to be outgoing to build meaningful friendships. Start with one genuine connection.";
        }
        if (message.includes("make") || message.includes("build")) {
            return "Join clubs, attend events, be in group chats, say yes to invitations, and be genuinely interested in others. Friendships form through consistent interaction.";
        }
        return "College is where you meet lifelong friends. Get involved in clubs, group studies, events, and activities. Be kind, be yourself, and right people will become your friends.";
    }

    if (message.match(/hostel|room|roommate|accommodation|stay|dorm/)) {
        if (message.includes("roommate") || message.includes("adjust")) {
            return "Communicate openly, set house rules early, respect space, share chores, and be considerate. Most conflicts solve with honest conversation.";
        }
        return "Keep your space clean, maintain good roommate relations, build community, and respect everyone's schedule. Hostel life teaches independence and adaptability.";
    }

    if (message.match(/event|fest|cultural|sports|dance|music|celebration|party/)) {
        return "Participate in fests, sports, cultural events - they're memories you'll cherish. You learn teamwork, leadership, and meet people. Go for it!";
    }

    if (message.match(/club|society|committee|volunteer|leadership|organize/)) {
        if (message.includes("which")) {
            return "Try 1-2 clubs that interest you. Attend meetings first, see if people are nice, check if it fits your schedule. Quality beats quantity.";
        }
        if (message.includes("lead") || message.includes("organize")) {
            return "Start small, listen to team members, delegate tasks, be organized, celebrate wins, and learn from failures. Leadership enables others to succeed.";
        }
        return "Clubs help you find your community, learn skills, and build friendships. Join one you love, participate actively, and take on responsibilities.";
    }

    if (message.match(/homesick|miss|family|parents|distance|adjust/)) {
        return "It's normal to feel homesick. Stay in touch with family, build a new circle, keep a routine, and give yourself time to adjust. Call home when needed.";
    }

    // === GOALS & PLANNING ===
    if (message.match(/goal|target|objective|plan|roadmap|future|vision/)) {
        if (message.includes("set")) {
            return "Set 3 goals: one academic, one skill-based, one personal. Make them specific, achievable, time-bound. Break into monthly milestones and review weekly.";
        }
        if (message.includes("achieve")) {
            return "Write goals down, break into weekly tasks, celebrate wins, track progress, and stay flexible. Review monthly and adjust based on what works.";
        }
        return "College years are for exploration and growth. Set goals, try new things, fail fast, learn, and adapt. Every experience shapes who you become.";
    }

    // === MENTAL HEALTH & EMOTIONS ===
    if (message.match(/stress|anxiety|pressure|overwhelm|depressed|sad|worried|scared|afraid/)) {
        if (message.includes("help")) {
            return "Talk to someone you trust, visit college counselor, practice deep breathing, take breaks. You're not alone. Seeking help is strength, not weakness.";
        }
        return "College is challenging, and it's okay to feel overwhelmed. Take one step, talk about feelings, get enough sleep, exercise, reach out to friends or counselors.";
    }

    if (message.match(/motivation|demotivated|discouraged|failure|setback|low|fail/)) {
        return "Setbacks are part of learning. Reflect on what went wrong, make a plan to improve, talk to mentors. Successful people have failed too. You're learning.";
    }

    if (message.match(/time|manage|balance|busy|schedule|prioritize|routine/)) {
        if (message.includes("many")) {
            return "Prioritize ruthlessly. List everything, pick the 3 most important, schedule them first. Say no to things that don't align with your goals.";
        }
        return "Create a weekly schedule, time-block major tasks, use a planner, batch similar work. Be realistic about time. Consistency beats perfection.";
    }

    if (message.match(/sleep|tired|rest|fatigue|insomnia|exhausted/)) {
        return "Sleep is crucial for memory and learning. Aim for 7-8 hours, keep consistent schedule, avoid screens 30 mins before bed, exercise during day.";
    }

    if (message.match(/financial|money|fee|scholarship|loan|sponsor|funding|budget/)) {
        return "Check college financial aid, apply for scholarships, use part-time work wisely, budget for essentials, look for free resources, talk to guardians.";
    }

    // === WEBSITE & NAVIGATION ===
    if (message.match(/homepage|goal.?tracker|road.?map|achievement.?wall|campus.?life|page|site|feature|guide/)) {
        return "Site has: Homepage (overview), Goal Tracker (set goals), Freshers Road Map (step guide), Achievement Wall (celebrate wins), Campus Life (tips), Sky (me!). Explore each!";
    }

    // === GENERIC HELPFULNESS ===
    if (message.match(/thank|thanks|thankyou|appreciate/)) {
        return "You're welcome! I'm here to help. College is a journey - be kind to yourself, stay curious, ask for help. You've got this! 💙";
    }

    if (message.match(/hi|hello|hey|greet/)) {
        return "Hey there! I'm Sky, your college companion. I can help with exams, placements, campus life, goals, relationships, mental health, and personal growth. Ask me anything!";
    }
    if (message.includes("goal") || message.includes("plan") || message.includes("roadmap") || message.includes("future") || message.includes("vision")) {
        return "Set one academic goal, one skill goal, and one personal goal this month. Break it into weekly steps, stay consistent, and celebrate every small win — even the tiny ones.";
    }
    if (message.includes("coding") || message.includes("programming") || message.includes("python") || message.includes("projects")) {
        return "Start with small coding tasks, build simple projects, and ask for help when you get stuck. Learning by doing helps more than just reading.";
    }

    if (message.includes("resume") || message.includes("cv") || message.includes("profile")) {
        return "Add your education, skills, projects, certifications, and achievements. Keep it short, highlight what you built, and show how you solved problems.";
    }

    if (message.includes("hackathon") || message.includes("competition") || message.includes("event")) {
        return "Focus on teamwork, simple working ideas, and a strong demo. Practice pitching your idea clearly and learn from other teams too.";
    }

    if (message.includes("club") || message.includes("society") || message.includes("activities")) {
        return "Clubs help you meet friends, learn new skills, and build leadership. Try one or two and see which feels fun and useful for your goals.";
    }

    if (message.includes("internship") || message.includes("job") || message.includes("placement")) {
        return "Build small projects, keep your LinkedIn updated, and apply often. Use campus resources, ask seniors for referrals, and practice interview questions.";
    }

    if (message.includes("campus") || message.includes("hostel") || message.includes("college life") || message.includes("freshers") || message.includes("semester") || message.includes("first week")) {
        return "College life is a mix of learning and growing. Make new friends, explore your interests, build a routine, and take care of yourself. It’s okay to feel nervous at first.";
    }

    if (message.includes("sad") || message.includes("stressed") || message.includes("anxious") || message.includes("overwhelmed") || message.includes("lonely") || message.includes("worried")) {
        return "I’m sorry you’re feeling this way. Talking to someone you trust, taking a short break, and pacing your work can help. You’re not alone, and it’s okay to ask for support.";
    }

    if (message.includes("help") || message.includes("advice") || message.includes("support") || message.includes("talk") || message.includes("listen")) {
        return "I’m here to help you with college goals, study routines, campus life, and emotional support too. Ask me anything and I’ll answer kindly and clearly.";
    }

    if (message.includes("home page") || message.includes("homepage") || message.includes("goal tracker") || message.includes("road map") || message.includes("achievement wall") || message.includes("campus life") || message.includes("sky")) {
        return "This site helps you navigate college with a homepage, goal tracker, road map, achievement wall, campus tips, and Sky AI support. Ask about any page and I’ll explain it.";
    }

    if (message.includes("why") || message.includes("how") || message.includes("what") || message.includes("where") || message.includes("when")) {
        return "I can answer questions about studying, campus life, goals, and emotional support. Try asking something like ‘How do I manage exam stress?’ or ‘What should I do in my first semester?’.";
    }

    if (message.includes("thank") || message.includes("thanks") || message.includes("thank you")) {
        return "You’re welcome! I’m always here if you want more advice about college, goals, or student life.";
    }

    return "I'm Sky - your AI companion for college success! I can help with: academics & exams, placements & interviews, skills & learning, campus life & friendships, goals & planning, and mental wellness. Ask me anything! 💙";
}