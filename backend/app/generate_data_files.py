import json
from pathlib import Path

root = Path(__file__).resolve().parent / 'data'
root.mkdir(parents=True, exist_ok=True)

companies = [
    'Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Adobe', 'Cisco', 'IBM', 'Salesforce'
]

topics = ['arrays', 'strings', 'graphs', 'trees', 'dp', 'design', 'greedy', 'sorting', 'heap', 'intervals']

difficulties = ['easy', 'medium', 'hard']

questions = []
for company in companies:
    for idx in range(50):
        topic = topics[(idx + companies.index(company)) % len(topics)]
        difficulty = difficulties[idx % len(difficulties)]
        title = f"{company} {topic.title()} Challenge {idx + 1}"
        slug = title.lower().replace(' ', '-').replace('_', '-')
        tags = [topic, 'leetcode', 'company']
        if topic == 'arrays':
            tags.extend(['two-pointers', 'sliding-window'])
        elif topic == 'strings':
            tags.extend(['string', 'pattern'])
        elif topic == 'graphs':
            tags.extend(['dfs', 'bfs'])
        elif topic == 'trees':
            tags.extend(['tree', 'dfs'])
        elif topic == 'dp':
            tags.extend(['dp', 'optimization'])
        elif topic == 'design':
            tags.extend(['design', 'system'])
        elif topic == 'greedy':
            tags.extend(['greedy', 'sorting'])
        elif topic == 'sorting':
            tags.extend(['sorting', 'two-pointers'])
        elif topic == 'heap':
            tags.extend(['heap', 'priority-queue'])
        elif topic == 'intervals':
            tags.extend(['intervals', 'sorting'])
        questions.append({
            'company': company,
            'title': title,
            'difficulty': difficulty,
            'topic': topic,
            'tags': tags,
            'description': f"Solve the {topic} problem commonly asked in {company} interviews.",
            'leetcode_slug': slug,
            'leetcode_url': f'https://leetcode.com/problems/{slug}',
        })

with open(root / 'dsa_questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2)

aptitude = []
quant = [
    ('percentage', 'easy'),
    ('addition', 'easy'),
    ('division', 'medium'),
    ('multiplication', 'easy'),
    ('squares', 'medium'),
]
logic = [
    ('sequence', 'easy'),
    ('series', 'medium'),
    ('pattern', 'hard'),
    ('logic', 'medium'),
    ('shapes', 'hard'),
]
verbal = [
    ('synonym', 'easy'),
    ('antonym', 'easy'),
    ('meaning', 'medium'),
    ('fill-in-the-blank', 'medium'),
    ('grammar', 'hard'),
]
words = ['concise', 'rapid', 'ancient', 'bright', 'fragile']
for i in range(600):
    if i % 3 == 0:
        topic = 'quantitative'
        template = quant[i % len(quant)]
        difficulty = template[1]
        a = 5 + (i % 15) * 2
        b = 10 + (i % 12) * 3
        if template[0] == 'percentage':
            value = 5 + (i % 20) * 2
            total = 50 + (i % 11) * 5
            question = f"What is {value}% of {total}?"
            correct = round(total * value / 100)
            options = [str(correct), str(correct + 2), str(max(1, correct - 3)), str(correct + 5)]
        elif template[0] == 'addition':
            question = f"Calculate the sum of {a} and {b}."
            correct = a + b
            options = [str(correct), str(correct + 3), str(correct - 2), str(correct + 5)]
        elif template[0] == 'division':
            question = f"If {a * 2} objects are split into {a} groups, how many objects are in each group?"
            correct = 2
            options = [str(correct), str(correct + 1), str(correct - 1), str(correct + 2)]
        elif template[0] == 'multiplication':
            question = f"Find the product of {a} and {b}."
            correct = a * b
            options = [str(correct), str(correct + a), str(correct - b), str(correct + b)]
        else:
            n = 2 + (i % 12)
            question = f"What is the square of {n}?"
            correct = n * n
            options = [str(correct), str(correct + n), str(correct - n), str(correct + 2)]
    elif i % 3 == 1:
        topic = 'logical'
        template = logic[i % len(logic)]
        difficulty = template[1]
        n = 2 + (i % 9)
        if template[0] == 'sequence':
            question = f"Find the next number in the sequence: {n}, {n+2}, {n+4}, {n+6}, ?"
            correct = n + 8
            options = [str(correct), str(correct + 2), str(correct - 2), str(correct + 4)]
        elif template[0] == 'series':
            question = f"Which number completes the series: {n}, {n*2}, {n*4}, ?"
            correct = n * 8
            options = [str(correct), str(correct + n), str(correct - n), str(correct + 2)]
        elif template[0] == 'pattern':
            question = f"Identify the missing term in the pattern: {n}, {n+1}, _, {n+3}."
            correct = n + 2
            options = [str(correct), str(correct + 1), str(correct - 1), str(correct + 3)]
        elif template[0] == 'logic':
            question = "If all cats are animals and all animals sleep, can cats sleep?"
            options = ["Yes", "No", "Maybe", "Cannot determine"]
            correct = options[0]
        else:
            question = "Which figure best completes the series of shapes described in a logical progression?"
            options = ["Figure A", "Figure B", "Figure C", "Figure D"]
            correct = options[2]
    else:
        topic = 'verbal'
        template = verbal[i % len(verbal)]
        difficulty = template[1]
        word = words[i % len(words)]
        if template[0] == 'synonym':
            question = f"Choose the synonym for '{word}'."
            options = ["brief", "slow", "large", "noise"] if word == 'concise' else ["fast", "tired", "old", "loud"]
            correct = options[0]
        elif template[0] == 'antonym':
            question = f"Choose the antonym for '{word}'."
            options = ["slow", "fast", "bright", "happy"] if word == 'rapid' else ["old", "new", "loud", "tiny"]
            correct = options[0]
        elif template[0] == 'meaning':
            question = f"Select the correct meaning of '{word}'."
            options = ["Old", "Dangerous", "Strong", "Flexible"] if word == 'ancient' else ["Bright", "Dark", "Weak", "Small"]
            correct = options[0]
        elif template[0] == 'fill-in-the-blank':
            question = "Choose the word that best fits: She was very ____."
            options = ["happy", "heavy", "quiet", "loud"]
            correct = options[0]
        else:
            question = "Which sentence is grammatically correct?"
            options = ["She writes every day.", "She write every day.", "She writing every day.", "She written every day."]
            correct = options[0]
    aptitude.append({
        'topic': topic,
        'difficulty': difficulty,
        'question': question,
        'options': options,
        'correct_option': 0,
        'explanation': f"The correct answer is {options[0]}.",
        'time_limit_seconds': 45,
    })

with open(root / 'aptitude_questions.json', 'w', encoding='utf-8') as f:
    json.dump(aptitude, f, indent=2)

print('Created', root / 'dsa_questions.json')
print('Created', root / 'aptitude_questions.json')
