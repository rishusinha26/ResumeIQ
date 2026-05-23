from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.document import JobDocument
from app.schemas.aptitude import AptitudeQuestion
from app.schemas.career import CareerRoadmapStep
from app.schemas.coding import CodingChallengeDocument, CodingTestCase
from app.schemas.dsa import DSAQuestion
from app.schemas.interview import InterviewQuestion
from app.schemas.modules_common import AptitudeTopic, CodingCategory, CodingLanguage, DifficultyLevel, InterviewTrack
from app.repositories.aptitude_repository import seed_questions, questions_collection, results_collection
from app.repositories.coding_repository import challenges_collection, seed_challenges, submissions_collection
from app.repositories.career_repository import analyses_collection, learning_paths_collection
from app.repositories.dsa_repository import seed_questions as seed_dsa_questions
from app.repositories.interview_repository import _collection as interviews_collection


DEFAULT_CODING_CHALLENGES = [
    CodingChallengeDocument(
        slug="two-sum",
        title="Two Sum",
        category=CodingCategory.arrays,
        difficulty=DifficultyLevel.easy,
        description="Return the indices of two numbers that add up to the target.",
        starter_code="def two_sum(nums, target):\n    pass\n",
        languages=[CodingLanguage.python, CodingLanguage.javascript, CodingLanguage.java, CodingLanguage.cpp],
        test_cases=[CodingTestCase(stdin="[2,7,11,15]\n9", expected_stdout="[0, 1]"), CodingTestCase(stdin="[3,2,4]\n6", expected_stdout="[1, 2]")],
        points=100,
    ),
    CodingChallengeDocument(
        slug="valid-parentheses",
        title="Valid Parentheses",
        category=CodingCategory.strings,
        difficulty=DifficultyLevel.easy,
        description="Check whether a string has balanced brackets.",
        starter_code="def is_valid(s):\n    pass\n",
        languages=[CodingLanguage.python, CodingLanguage.javascript, CodingLanguage.java, CodingLanguage.cpp],
        test_cases=[CodingTestCase(stdin="()[]{}", expected_stdout="True"), CodingTestCase(stdin="(]", expected_stdout="False")],
        points=100,
    ),
    CodingChallengeDocument(
        slug="longest-common-subsequence",
        title="Longest Common Subsequence",
        category=CodingCategory.dp,
        difficulty=DifficultyLevel.medium,
        description="Compute the length of the longest common subsequence between two strings.",
        starter_code="def lcs(a, b):\n    pass\n",
        languages=[CodingLanguage.python, CodingLanguage.javascript, CodingLanguage.java, CodingLanguage.cpp],
        test_cases=[CodingTestCase(stdin="abcde\nace", expected_stdout="3"), CodingTestCase(stdin="abc\ndef", expected_stdout="0")],
        points=150,
    ),
    CodingChallengeDocument(
        slug="shortest-path-unweighted",
        title="Shortest Path in Unweighted Graph",
        category=CodingCategory.graphs,
        difficulty=DifficultyLevel.medium,
        description="Use BFS to compute the shortest distance between two nodes.",
        starter_code="from collections import deque\n\ndef shortest_path(graph, start, end):\n    pass\n",
        languages=[CodingLanguage.python, CodingLanguage.javascript, CodingLanguage.java, CodingLanguage.cpp],
        test_cases=[CodingTestCase(stdin="1\n1 2\n2 3\n1 3", expected_stdout="2")],
        points=150,
    ),
    CodingChallengeDocument(
        slug="sql-top-users",
        title="Top Users by Orders",
        category=CodingCategory.sql,
        difficulty=DifficultyLevel.medium,
        description="Write a SQL query that returns the top users by total orders.",
        starter_code="SELECT user_id, COUNT(*) AS order_count FROM orders GROUP BY user_id ORDER BY order_count DESC;",
        languages=[CodingLanguage.sql],
        test_cases=[CodingTestCase(stdin="", expected_stdout="")],
        points=120,
    ),
]


DEFAULT_APTITUDE_QUESTIONS = [
    AptitudeQuestion(topic=AptitudeTopic.quantitative, difficulty=DifficultyLevel.easy, question="What is 15% of 200?", options=["20", "25", "30", "35"], correct_option=2, explanation="15% of 200 is 30.", time_limit_seconds=45),
    AptitudeQuestion(topic=AptitudeTopic.logical, difficulty=DifficultyLevel.easy, question="Find the next number: 2, 4, 8, 16, ?", options=["24", "30", "32", "36"], correct_option=2, explanation="Each term doubles.", time_limit_seconds=45),
    AptitudeQuestion(topic=AptitudeTopic.verbal, difficulty=DifficultyLevel.medium, question="Choose the synonym of 'concise'.", options=["brief", "loud", "slow", "rough"], correct_option=0, explanation="Concise means brief.", time_limit_seconds=45),
]


def _build_quantitative_question(index: int) -> AptitudeQuestion:
    if index % 3 == 0:
        value = 5 + (index % 16) * 3
        total = 50 + (index % 21) * 5
        correct = round((value / 100) * total)
        return AptitudeQuestion(
            topic=AptitudeTopic.quantitative,
            difficulty=DifficultyLevel.easy if index % 5 != 0 else DifficultyLevel.medium,
            question=f"What is {value}% of {total}?",
            options=[str(correct), str(correct + 2), str(max(1, correct - 3)), str(correct + 5)],
            correct_option=0,
            explanation=f"{value}% of {total} is {correct}.",
            time_limit_seconds=40,
        )
    if index % 3 == 1:
        a = 10 + (index % 12) * 2
        b = 11 + (index % 8) * 3
        correct = a + b
        return AptitudeQuestion(
            topic=AptitudeTopic.quantitative,
            difficulty=DifficultyLevel.easy,
            question=f"Calculate the sum: {a} + {b}.",
            options=[str(correct), str(correct + 4), str(correct - 5), str(correct + 7)],
            correct_option=0,
            explanation=f"The addition of {a} and {b} is {correct}.",
            time_limit_seconds=40,
        )
    x = 2 + (index % 9)
    y = 10 + (index % 15) * 2
    correct = y // x
    return AptitudeQuestion(
        topic=AptitudeTopic.quantitative,
        difficulty=DifficultyLevel.medium,
        question=f"If {y} units are divided equally among {x} people, how many units does each get?",
        options=[str(correct), str(correct + 1), str(max(1, correct - 1)), str(correct + 2)],
        correct_option=0,
        explanation=f"Each person receives {correct} units when {y} is divided by {x}.",
        time_limit_seconds=45,
    )


def _build_logical_question(index: int) -> AptitudeQuestion:
    if index % 3 == 0:
        start = 2 + (index % 6) * 2
        diff = 2 + (index % 5)
        sequence = ", ".join(str(start + diff * i) for i in range(4))
        correct = start + diff * 4
        return AptitudeQuestion(
            topic=AptitudeTopic.logical,
            difficulty=DifficultyLevel.easy,
            question=f"Find the next number in the sequence: {sequence}, ?",
            options=[str(correct), str(correct + diff), str(correct - diff), str(correct + diff * 2)],
            correct_option=0,
            explanation="The sequence increases by a fixed difference.",
            time_limit_seconds=45,
        )
    if index % 3 == 1:
        a = 3 + (index % 5)
        b = a + 1
        c = b + 1
        correct = c + 1
        return AptitudeQuestion(
            topic=AptitudeTopic.logical,
            difficulty=DifficultyLevel.medium,
            question=f"Complete the pattern: {a}, {b}, {c}, ?",
            options=[str(correct), str(correct + 1), str(correct - 1), str(correct + 2)],
            correct_option=0,
            explanation="The pattern increases by 1 each time.",
            time_limit_seconds=50,
        )
    correct = 2 + (index % 4)
    return AptitudeQuestion(
        topic=AptitudeTopic.logical,
        difficulty=DifficultyLevel.hard,
        question=f"If two trains leave stations 100 miles apart and meet after {correct} hours, what is their combined average speed in miles per hour?",
        options=[str(100 // correct), str(100 // max(1, correct - 1)), str(100 // (correct + 1)), str(100 // max(1, correct - 2))],
        correct_option=0,
        explanation="Distance divided by time gives the combined average speed.",
        time_limit_seconds=55,
    )


def _build_verbal_question(index: int) -> AptitudeQuestion:
    adjectives = [
        ("concise", "brief", "wordy", "loud", "slow"),
        ("rapid", "fast", "lazy", "noisy", "sleepy"),
        ("ancient", "old", "new", "bright", "gentle"),
    ]
    word, correct, wrong1, wrong2, wrong3 = adjectives[index % len(adjectives)]
    difficulty = DifficultyLevel.easy if index % 4 != 0 else DifficultyLevel.medium
    return AptitudeQuestion(
        topic=AptitudeTopic.verbal,
        difficulty=difficulty,
        question=f"Choose the synonym of '{word}'.",
        options=[correct, wrong1, wrong2, wrong3],
        correct_option=0,
        explanation=f"The synonym of {word} is {correct}.",
        time_limit_seconds=50,
    )


def build_topic_question_set(topic: AptitudeTopic, total: int) -> list[AptitudeQuestion]:
    builder = {
        AptitudeTopic.quantitative: _build_quantitative_question,
        AptitudeTopic.logical: _build_logical_question,
        AptitudeTopic.verbal: _build_verbal_question,
    }[topic]
    return [builder(i) for i in range(total)]


DEFAULT_APTITUDE_QUESTIONS = [
    *build_topic_question_set(AptitudeTopic.quantitative, 1000),
    *build_topic_question_set(AptitudeTopic.logical, 1000),
    *build_topic_question_set(AptitudeTopic.verbal, 1000),
]


DEFAULT_DSA_QUESTIONS = [
    DSAQuestion(
        company="Amazon",
        title="Two Sum",
        difficulty=DifficultyLevel.easy,
        topic="arrays",
        tags=["arrays", "hash-table"],
        description="Find two numbers in an array that add up to a target value.",
        leetcode_slug="two-sum",
        leetcode_url="https://leetcode.com/problems/two-sum",
    ),
    DSAQuestion(
        company="Amazon",
        title="Kth Largest Element in an Array",
        difficulty=DifficultyLevel.medium,
        topic="heap",
        tags=["heap", "selection"],
        description="Return the kth largest element in an unsorted array.",
        leetcode_slug="kth-largest-element-in-an-array",
        leetcode_url="https://leetcode.com/problems/kth-largest-element-in-an-array",
    ),
    DSAQuestion(
        company="Google",
        title="Longest Substring Without Repeating Characters",
        difficulty=DifficultyLevel.medium,
        topic="strings",
        tags=["strings", "sliding-window"],
        description="Find the length of the longest substring without repeating characters.",
        leetcode_slug="longest-substring-without-repeating-characters",
        leetcode_url="https://leetcode.com/problems/longest-substring-without-repeating-characters",
    ),
    DSAQuestion(
        company="Google",
        title="Merge Intervals",
        difficulty=DifficultyLevel.medium,
        topic="intervals",
        tags=["intervals", "sorting"],
        description="Merge all overlapping intervals in a list.",
        leetcode_slug="merge-intervals",
        leetcode_url="https://leetcode.com/problems/merge-intervals",
    ),
    DSAQuestion(
        company="Microsoft",
        title="Binary Tree Inorder Traversal",
        difficulty=DifficultyLevel.easy,
        topic="trees",
        tags=["trees", "dfs"],
        description="Return the inorder traversal of a binary tree.",
        leetcode_slug="binary-tree-inorder-traversal",
        leetcode_url="https://leetcode.com/problems/binary-tree-inorder-traversal",
    ),
    DSAQuestion(
        company="Microsoft",
        title="Word Ladder",
        difficulty=DifficultyLevel.hard,
        topic="graphs",
        tags=["graphs", "bfs"],
        description="Compute the minimum number of transformations to change one word into another.",
        leetcode_slug="word-ladder",
        leetcode_url="https://leetcode.com/problems/word-ladder",
    ),
    DSAQuestion(
        company="Meta",
        title="Course Schedule",
        difficulty=DifficultyLevel.medium,
        topic="graphs",
        tags=["graphs", "cycle-detection"],
        description="Determine if all courses can be finished given prerequisites.",
        leetcode_slug="course-schedule",
        leetcode_url="https://leetcode.com/problems/course-schedule",
    ),
    DSAQuestion(
        company="Meta",
        title="Number of Islands",
        difficulty=DifficultyLevel.medium,
        topic="graphs",
        tags=["dfs", "bfs"],
        description="Count the number of islands in a grid.",
        leetcode_slug="number-of-islands",
        leetcode_url="https://leetcode.com/problems/number-of-islands",
    ),
    DSAQuestion(
        company="Apple",
        title="LRU Cache",
        difficulty=DifficultyLevel.hard,
        topic="design",
        tags=["design", "linked-list", "hash-table"],
        description="Implement a least recently used cache with O(1) operations.",
        leetcode_slug="lru-cache",
        leetcode_url="https://leetcode.com/problems/lru-cache",
    ),
    DSAQuestion(
        company="Apple",
        title="Minimum Window Substring",
        difficulty=DifficultyLevel.hard,
        topic="strings",
        tags=["strings", "sliding-window"],
        description="Find the smallest substring containing all characters of another string.",
        leetcode_slug="minimum-window-substring",
        leetcode_url="https://leetcode.com/problems/minimum-window-substring",
    ),
]


def _load_questions_from_json(path: Path, model_class):
    if not path.exists():
        return []
    try:
        with path.open("r", encoding="utf-8") as file:
            items = json.load(file)
        return [model_class(**item) for item in items]
    except Exception:
        return []


def _load_aptitude_questions() -> list[AptitudeQuestion]:
    path = Path(__file__).resolve().parent.parent / "data" / "aptitude_questions.json"
    return _load_questions_from_json(path, AptitudeQuestion)


def _load_dsa_questions() -> list[DSAQuestion]:
    path = Path(__file__).resolve().parent.parent / "data" / "dsa_questions.json"
    return _load_questions_from_json(path, DSAQuestion)


async def ensure_module_indexes(db: AsyncIOMotorDatabase) -> None:
    await interviews_collection(db).create_index([("user_id", 1), ("created_at", -1)])
    await challenges_collection(db).create_index([("slug", 1)], unique=True)
    await submissions_collection(db).create_index([("user_id", 1), ("created_at", -1)])
    await submissions_collection(db).create_index([("challenge_id", 1), ("score", -1)])
    await questions_collection(db).create_index([("topic", 1), ("difficulty", 1)])
    await results_collection(db).create_index([("user_id", 1), ("created_at", -1)])
    await analyses_collection(db).create_index([("user_id", 1), ("created_at", -1)])
    await learning_paths_collection(db).create_index([("user_id", 1), ("updated_at", -1)])
    await seed_challenges(db, DEFAULT_CODING_CHALLENGES)
    aptitude_questions = _load_aptitude_questions() or DEFAULT_APTITUDE_QUESTIONS
    dsa_questions = _load_dsa_questions() or DEFAULT_DSA_QUESTIONS
    await seed_questions(db, aptitude_questions)
    await seed_dsa_questions(db, dsa_questions)