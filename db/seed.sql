/*  Initial seed data for Coursality */

USE coursality;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;


/* 1) UNIVERSITIES */


INSERT INTO university (name) VALUES ('Beirut Arab University');
INSERT INTO university (name) VALUES ('American University of Beirut');
INSERT INTO university (name) VALUES ('Lebanese American University');
INSERT INTO university (name) VALUES ('Lebanese International University');
INSERT INTO university (name) VALUES ('Université Saint-Joseph de Beyrouth');
INSERT INTO university (name) VALUES ('University of Balamand');



/*  2) DEPARTMENTS */

INSERT INTO department (name, university_id)
SELECT
  'Mathematics and Computer Science',
  u.university_id
FROM university u
WHERE u.name = 'Beirut Arab University';

INSERT INTO department (name, university_id)
SELECT
  'Computer Science',
  u.university_id
FROM university u
WHERE u.name = 'American University of Beirut';

INSERT INTO department (name, university_id)
SELECT
  'Computer Science and Mathematics',
  u.university_id
FROM university u
WHERE u.name = 'Lebanese American University';

INSERT INTO department (name, university_id)
SELECT
  'Computer Science and Information Technology',
  u.university_id
FROM university u
WHERE u.name = 'Lebanese International University';

INSERT INTO department (name, university_id)
SELECT
  'Informatique',
  u.university_id
FROM university u
WHERE u.name = 'Université Saint-Joseph de Beyrouth';

INSERT INTO department (name, university_id)
SELECT
  'Computer Science',
  u.university_id
FROM university u
WHERE u.name = 'University of Balamand';

/*  3) COURSES */

INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 241',
  'Introduction to Programming',
  'This course consists of an Introduction to computer hardware and software. Binary system and data representation. The software life-cycle. Flow charts and IPO-charts. Introduction to computer programming and problem solving. Structured high level language programming with an emphasis on procedural abstraction and good programming style. The basic looping and selection constructs, arrays, functions, parameter passing, and scope of variables.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 244',
  'Digital Circuits',
  'An introduction to digital electronics, integrated circuits, numbering systems, Boolean algebra, gates, flip-flops, multiplexers, sequential circuits, combinational circuits, and computer architecture. Introduction to hardware description language and programmable logic devices.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 248',
  'Discrete Structures I',
  'The course introduces basic discrete structures that are backbones of computer science. In particular, this class is meant to introduce logic, proofs, sets, relations, functions, sequences, summations, counting techniques with an emphasis on applications in computer science. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 242',
  'Object Oriented Programming',
  'This course focuses on object-oriented concepts and techniques for analysis, design, and implementation. Topics include methods and parameters passing, recursive methods, objects and classes, UML representation of classes, abstraction, encapsulation and information hiding, message passing, methods overloading and overriding, classes relationships (aggregation, composition), inheritance, polymorphism, abstract classes, interfaces, Exception handling, Files.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 246',
  'Web Programming',
  'The course covers different techniques and technologies for developing dynamic web sites. Topics include introduction to internet infrastructure, PHP as the server-side scripting language, the MySQL database, JavaScript, DHTML, XML and AJAX for enriching web services, and page layout with HTML and CSS. This course includes a team project to deploy a dynamic website. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 344',
  'Software Engineering',
  'Different phases of large-scale software development with emphasis on analysis, design, testing, and documentation. Topics include: introduction to software engineering, ethics in software engineering, development processes, requirements developments, object oriented analysis and design using UML, architectural design, testing, and project management. Students work in groups on realistic projects to apply covered techniques. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 346',
  'Theory of Computation',
  'This course is an introduction to the fundamental models of computation used throughout computer science. Topics include deterministic finite automata (DFA), regular languages, non-deterministic finite automata (NFA), equivalence of NFAs and DFAs, closure properties, regular expressions, the pumping lemma, pushdown automata, context free languages, context free grammar, ambiguity, Chomsky normal form, Turing machines, decidability, the halting problem and topics related to time complexity, P, NP and NP-Completeness. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 445',
  'Concept of Programming Languages',
  'This course will define, analyze and evaluate important concepts found in current programming languages. Its goals are to build an ability to evaluate and compare programming languages, both from the user''s and implementor''s view. Topics include: syntax, operational semantics, scope of objects and time of binding, type checking, module mechanisms (e.g., blocks, procedures, coroutines), data abstraction, data types, expressions, control structures, subprograms, implementation of subprograms, functional programming, logic programming and object-oriented programming languages. This course includes a team project to learn a novel programming language and use it in implementing an application. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 442',
  'Operating Systems',
  'Operating systems concepts and functions. Operating systems structures and system Calls. Processes and threads scheduling. Inter-process communication. CPU scheduling algorithms. Process synchronization. Deadlocks. Main memory management. Virtual memory management. File management. I/O subsystem and device management. Selected topics in networking, protection and security, distributed systems.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 441',
  'Fundamentals of Algorithms',
  'A systematic study of algorithms and their complexity. Topics include techniques for designing efficient computer algorithms, proving their correctness, analyzing their run-time complexity; as well as Divide and Conquer algorithms, Greedy algorithms, Dynamic Programming algorithms, Sorting and Searching algorithms (Binary search, Radix sort, Bucket sort, Count Sort, Insertion sort, Merge sort, Quick sort and Heap sort), Order statistics, Graph algorithms (Graph traversal, Minimum spanning trees and Shortest path problems). ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Mathematics and Computer Science'
  AND u.name = 'Beirut Arab University';


  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 101',
  'Introduction to Computer Science',
  'This course introduces the skills, concepts, and capabilities needed for effective use of information technology (IT). It includes logical reasoning, organization of information, managing complexity, operations of computers and networks, digital representation of information, security principles, and the use of contemporary applications such as effective Web search, spreadsheets, and database systems. Also, it includes a basic introduction to programming and problem solving through scripting web applications. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 206',
  'Computers and Programming for the Arts',
  'This course is an introductory computer course that presents computing and information, and illustrates their use. The student is introduced to computers and their role in society with emphasis on conceptual understanding as well as operational proficiency. Topics include principles of computer operations both from the hardware and software perspectives, basic networking concepts, web authoring concepts including HTML, cascading style sheets, and publishing, and data manipulation using spreadsheets and databases. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 207',
  'Programming for Digital Art',
  'This course introduces students to the technical and conceptual skills necessary for developing web sites and for analyzing and visualizing real data . In web design, students will learn HTML5 and CSS3. In data analysis and visualization, students will learn to code using Python with an emphasis on organizing, analyzing, and plotting data. Visualizations produced by Python can then be embedded into html pages. The core skills learned in this course will be applicable to most programming languages. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 212',
  'Intermediate Programming with Data Structures',
  'A continuation of CMPS 200, this course consolidates algorithm design and programming techniques, emphasizing large programs. This course also provides a detailed study of data structures and data abstraction, and an introduction to complexity considerations and program verification.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 230',
  'Digital Media Programming',
  'The class is an introduction to digital media programming and processing. The course explains the essential technology behind images, animations, sound, and video and illustrates how to write interactive programs that manipulate these media in creative ways. The class assumes basic knowledge in Java or a first course in programming. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 251',
  'Numerical Computing',
  'Techniques of numerical analysis: number representations and round-off errors, root finding, approximation of functions, integration, solving initial value problems, MonteCarlo methods. Implementations and analysis of the algorithms are stressed. Projects using MATLAB or a similar tool are assigned.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 253',
  'Software Engineering',
  'This course introduces practical industry-standard software engineering best practices to students that have already written moderate sized software. Students are exposed to full development lifecycle from choosing the right SDLC, to requirements management, software design, development, patterns, testing and UAT. A group term project provides a holistic hands-on experience building an end-to-end software application emulating a real-world environment often for real clients with real needs. Other topics covered include working in a team, professionalism, project management, risk, and ethics. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 256',
  'Algorithms and Data Structures',
  'A systematic study of algorithms and advanced data structures and their complexity. Topics include techniques for designing efficient computer algorithms, proving their correctness, and analyzing their complexity as well as advanced searching, sorting, selection, priority queues, binary search trees, graph, hash tables, and matrix algorithms.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 272',
  'Operating Systems',
  'This course provides an introduction to the fundamentals of operating system function, design, and implementation. It contains a theory component illustrating the concepts and principles that underlie modern operating systems and a practice component to relate theoretical principles with operating system implementation. The course is divided into three major parts. The first part of the course discusses concurrency (processes, threads, scheduling, synchronization, and deadlocks). The second part of the course discusses memory management (memory management strategies and virtual memory management). The third part of the course concerns file systems, including topics such as secondary storage systems and I/O systems.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CMPS 274',
  'Compiler Construction',
  'A course that covers syntax specifications of programming languages, parsing theory, top-down and bottom-up parsing, parser generators, syntax-directed code generation, symbol table organization and management, dynamic storage allocation, code optimization, dataflow analysis, and register allocation. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'American University of Beirut';


  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 243',
  'Introduction to Object-Oriented Programming',
  'This course introduces the fundamental concepts, and techniques, of programming and problem solving, from an object-oriented perspective. Topics include the introduction to computer systems (hardware, software, compilation, execution), fundamental programming constructs, (variables, primitive data types, expressions, assignment), program readability, simple I/O, conditional constructs, iterative control structures, structured decomposition, method call and parameter passing, basic program design using algorithms, algorithm stepwise refinement, pseudo-code, introduction to the object-oriented paradigm (abstraction, objects, classes, entity and application classes, class libraries, methods, encapsulation, class interaction, aggregation), inheritance, error types, simple testing and debugging, 1-D and 2-D arrays, basic searching, and sorting algorithms.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 245',
  'Objects and Data Abstraction',
  'This course presents further techniques of object oriented programming and problem solving, with emphasis on abstraction and data structures. Topics include: object oriented concepts, such as, composition, inheritance, polymorphism, information hiding, and interfaces; basic program design and correctness, such as, abstract data types, preconditions and post conditions, assertions and loop invariants, testing, basic exception handling, and the application of algorithm design techniques. The course also covers: basic algorithmic analysis, time and space tradeoffs in algorithms, big-O notation; fundamental data structures and applications, such as, collections, single- and double-linked structures, stacks, queues, and trees; performance issues for data structures; recursion, more sorting algorithms.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 310',
  'Algorithms and Data Structures',
  'This course presents the fundamental computing algorithms and data structures, with emphasis on design and analysis. Topics include the asymptotic analysis of upper and average complexity bounds, the best, the average, and the worst, case behaviors. Recurrence relations, sets, hashing and hash tables, trees and binary trees (properties, tree traversal algorithms), heaps, priority queues, and graphs (representation, depth- and breadth-first traversals and applications, shortest-path algorithms, transitive closure, network flows, topological sort). The course also covers the sorting algorithms and performance analysis which include mergesort, quicksort and heapsort. As well, the course details the fundamental algorithmic strategies (divide-and-conquer approach, greedy, dynamic programming, and backtracking). Introduction to NP-completeness theory.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 320',
  'Computer Organization',
  'Overview of the history of the digital computer, representation of numeric data, introduction to digital logic, logic expressions and Boolean functions, logic functions minimization. Processor and system performance, Amdahl’s law. Introduction to reconfigurable logic and special-purpose processors. Introduction to instruction set architecture, and microarchitecture. Processor structures, instruction sequencing, flow-of control, subroutine call and return mechanism, structure of machine-level programs, low level architectural support for high-level languages. Memory hierarchy, latency and throughput, cache memories: operating principles, replacement policies, multilevel cache, and cache coherency. Register-transfer language to describe internal operations in a computer, instruction pipelining and instruction-level parallelism (ILP), overview of superscalar architectures. Multicore and multithreaded processors.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 447',
  'Parallel Programming for Multicore and Cluster Systems',
  'This course provides an introduction to prallel programming with a focus on multicore architectures and cluster programming techniques. Topics include relevant architectural trends and aspects of multicores, writing multicore programs and extracting data parallelism using vectors and SIMD, thread-level parallelism, task-based parallelism, efficient sybchronization, program profiling, and performance tuning. Message-passing cluster-based parallel computing is also introduced. The course includes several programming assignments to provide students first-hand experience with programming, and experimentally analyzing and tuning parallel software.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 490',
  'Software Engineering',
  'This course presents the techniques for developing reliable, and cost-effective, medium-to-large-scale object-oriented and classical software. It also involves project development to implement these techniques. Topics include the software life-cycle and process models, the software requirements elicitation, specification, and validation techniques, the design techniques for object-oriented and classical software (architectural, and component, level design and the basic unified modeling language diagrams), software testing (black box and white box testing techniques), unit, integration, validation, and system testing, as well as the basic software project management and quality issues, and the documentation and technical writing, and the use of CASE tools.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 375',
  'Database Management Systems',
  'This course is an introduction to the fundamental concepts and techniques of database systems. Topics include database architecture, data independence, data modeling, physical and relational database design, functional dependency, normal forms, query languages, query optimization, database security, and transactions at the SQL level.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 326',
  'Operating Systems',
  'This course introduces the fundamentals of operating systems design and implementation. Topics include C language and shell programming, operating system components, dynamic memory allocation, text processing, memory management, virtual memory, files, pipes, processes, process scheduling, process synchronization (mutual exclusion, deadlocks), and threads.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 461',
  'Introduction to Machine Learning',
  'This course provides an overview of theoretical and application aspects of machine learning. Topics include supervised and unsupervised learning including generative/discriminative learning, parametric/non-parametric learning, neural networks, support vector machines, clustering, dimensionality reduction, and kernel methods. The course also covers learning theory, reinforcement learning, adaptive control. An applied approach will be used, where students get hands-on exposure to ML techniques through the use of state-of-the-art machine learning software frameworks.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSC 464',
  'Deep Learning for Natural Language Processing',
  'Understanding complex language has wide applications in web search, advertisement, customer service, automatic translation, chat bot engineering, etc. Many different machine learning techniques are at the heart of natural language processing (NLP) applications. Recently, Deep Learning(DL) approaches have obtained very high performance across many different NLP tasks. This course covers such approaches. Students will build their own neural network model and apply it to a large scale NLP problem. From the model side, the following topics will be covered: word vector representations, window-based neural networks, recurrent neural networks, long-short-term-memory models, recursive neural networks, convolutional neural networks. From the NLP side, the course covers the following topics: syntax parsing, vector space modeling, dimensionality reduction, speech tagging, text classification, and sentiment analysis.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Mathematics'
  AND u.name = 'Lebanese American University';


INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 390',
  'Web Programming',
  'The course investigates various techniques used for designing web pages. Presenting the basics of static web page design using HTML. Dynamic web page design using JavaScript. Introduces the server side scripting languages such as : ASP and PHP4.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 373',
  'Robotics Design & Coding ',
  'This course introduces the basic concepts and principles for using the Arduino microcontroller platform as an instrument to teach students about topics in electronics, programming, and human-computer interaction. Students will be able to build useful devices. Half of the in-class time is entirely devoted to developing, debugging, and refining projects where each session will have a period to solve a problem by the instructor and a period dedicated to the students to practice on a similar problem.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 345',
  'Digital Logic',
  'The course develops the ability of the student to understand the design of digital electronic circuits which are the main components in digital computers, data communication, digital recording, and so forth. The course covers number systems, Boolean switching algebra, combinational circuit design, flip-flops, counters, registers, state machine notation, analysis of sequential circuits, and sequential circuit design',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 335',
  'Database Systems',
  'This course introduces fundamentals of database systems. It starts by motivating the need of the database approach in real life scenarios and the benefit of adopting a Database Management System (DBMS). This course includes data modeling (based on the entity relationship model), data normalization and data manipulation SQL queries. Students will learn how to design, implement and query a relational database by using a Microsoft SQL Server DBMS.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 342',
  'Fundamentals of Networking Technologies',
  'The ITNcourse introduces the architecture, structure, functions, components, and models of the Internet and other computer networks. The principles and structure of IP addressing and the fundamentals of Ethernet concepts, media, and operations are introduced to provide a foundation for the CCNA curriculum.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 392',
  'Computer Networks',
  'The Routing and Switching Essentials course describes the architecture, components, and operations of routers and switches in a small network. Students learn how to configure a router and a switch for basic functionality.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 490',
  'Information System Development',
  'Information systems development is a legitimate engineering discipline. Software process models, software engineering methods, and software tools have been adopted successfully across a broad spectrum of industry applications. Effective development of an information system depends on proper utilization of a broad range of information technology, including database management systems, operating systems, computer systems, and telecommunications networks. This course covers the phases from physical system design through the installation of working information systems; Concentrates on using the results of systems analysis and design, typically documented in CASE technology, and either building or generating systems to meet these specifications. The course is a semesterlong field project with various hands-on exercises that provide practical experience in building, testing, and installing a system.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 378',
  'Data Structures and Algorithms',
  'This course covers the design and implementation of important data structures and their algorithms. The data structures considered include stacks, queues, lists, linked lists, trees, and graphs. Students will also learn basic to fundamental algorithms for solving problems and how to compute the time complexity of algorithms and will focus on general design and analysis techniques that lie beneath these algorithms.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 430',
  'Operating Systems',
  'Fundamental overview of operating systems. First Quarter: Operating system structures, processes, process synchronization, deadlocks, CPU scheduling, memory management, file systems, secondary storage management. Requires substantial programming projects. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSCI 351',
  'Concepts of Programming Languages',
  'The course introduces the main concepts of current programming languages and provides the student with the tools necessary to evaluate existing and future programming languages. It also explains the design of compilers by explaining in depth the programming language structures, describing the syntax in a formal method and introducing approaches to lexical and syntactic analysis',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science and Information Technology'
  AND u.name = 'Lebanese International University';

  
  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026DEPAL4',
  'Design Patterns',
  'This course will allow students who have already learned the notions of object-oriented programming in C++ or C#, to recognize and identify the design models and apply the design principles in their development. Students will be able to carry out an architectural analysis to produce the structural units, design the interfaces to ensure the integration of the different components of the solution, carry out the detailed design of the solution and develop the code. The course covers all the usual models: Abstract Factory - Builder - Factory Method - Object Pool - Prototype - Singleton - Adapter - Bridge - Composite - Decorator - Facade - Flyweight – Private Class Data - Proxy - Chain of responsibility - Command - Interpreter - Iterator - Mediator - Memento - Null Object - Observer - State - Strategy - Template method - Visitor. ',
  4,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026CILOL1',
  'Digital Circuits',
  'This course introduces the basic notions of digital electronics and presents the functional aspects of combinatorial and sequential digital circuits. It covers, in a first phase, coding, digitization systems, combinatorial circuits through the expression of a logic function, logic gates, Boolean algebra and the different reduction techniques. In a second phase, we approach state machines and sequential circuits with the different types of flip-flops and the implementations of sequential circuits such as counters and shift registers. For each system, we move from analysis to synthesis of circuits using different methods. Part of the lab work takes place around the Quartus II tool which allows students to implement digital circuits in a schematic or descriptive form and to simulate and analyze the circuits with signals and practical considerations. The other part of the lab work is reserved for the practical creation of digital circuits using integrated circuits on a breadboard to allow students to discover electronic components and their wiring.',
  6,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026CLVLL6',
  'Cloud and Virtualization ',
  'This course introduces the concepts of Cloud, Data Centers, and virtualization with the different associatedtechnologies. It covers the following topics: Introduction to Data Centers and the Cloud - Strategic Data Center - Principles and types of Data Centers - Data Center Design - Cloud Computing - Cloud Security - Software-Defined Approach for Networks (SDN), Data Center (SDDC) and Storage (SDS) - Virtualization - Workstation and Server Virtualization - Data Virtualization - Operating System Virtualization - Network Function Virtualization. ',
  4,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026STDAL3',
  'Data Structures and Algorithms',
  'This course covers the following themes: complexity analysis, elementary data structures (linked lists, arrays, queues and stacks), search problems (sequential, dichotomy), sorting problems (elementary sorting, quicksort, merge sort), trees (characteristics, structure, traversal), string search algorithms, priority queues, maximize, graphs (characteristics, structures), graph algorithms (shortest path, connectivity, spanning tree, etc.), scheduling problems, flow problems (maximum flow, minimum cost flow, etc.), coupling problems, dynamic programming, linear programming (simplex). ',
  6,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026FIDEL5',
  'Firmware Design',
  'This course focuses on mastering C programming for microcontroller-based embedded system environments. It covers the internal structure and operation of microcontrollers, firmware architecture methodologies including low-level drivers, interfacing, and task-based programming. Topics include: computer architecture in limited resource platforms, C programming with pointers and data structures, code optimization for limited resources (RAM, program memory, and speed), firmware architecture including flat and task-based programming approaches (schedulers, RTOS, etc.), system debugging, simulation, emulation, and source control using GIT repositories (commit, checkout, push, pull, branch, merge, etc.). ',
  4,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026FINTL5',
  'Fintech',
  'This course is designed for students interested in exploring how new technologies are disrupting the financial services industry, leading to radical changes in business models, products, applications, and the customer user interface. Participants will explore artificial intelligence, deep learning, blockchain technology, and application programming interfaces (APIs), as well as the specific opportunities for their application in the following areas: payments, credit, trading, and risk management. We will review the competitive advantages of leading Fintech companies and startups, global finance and technology leaders',
  2,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026GDEVL4',
  'Game Development',
  'This course is designed for students with a basic programming background. Its goal is to introduce them to game development using Unreal Engine. By the end of the course, students should be capable of creating a basic game. Topics covered include game development fundamentals, Unity Engine, interface navigation, scene building, Blueprints scripting, and creating both 2D platformers and 3D first-person shooter games. 
',
  4,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026INCYL4',
  'Introduction to Cybersecurity',
  'This course introduces the basic concepts related to information and network security. It helps develop the skills necessary to troubleshoot and protect data networks from threats and attacks. It covers the following topics: Network Basics - Network Protocols and TCP/IP - Introduction to Cybersecurity - Computer Security and Malware - Physical Security - Information Security (confidentiality, integrity, and availability) - Types of Attacks and Protection Methods - Network Security, Level 2 and 3 Attacks.',
  4,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026MALEL5',
  'Machine Learning',
  'Machine learning (ML) is a subfield of artificial intelligence. It is the science of making machines learn by example. The ultimate goal of ML is to create a computer capable of learning autonomously from examples. The main research topics in ML include: natural language understanding, computer vision, and self-driving cars. In this course, we will study the implementation of different algorithms using python with tensorflow and keras. We will present several algorithms such as decision trees, random forest, support vector machines, neural networks as well as other algorithms.',
  4,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  '026PROOL3',
  'Object-Oriented Programming and C++',
  'This course introduces object-oriented programming in C++. It covers the structure of a C++ program, types and variables, expressions and instructions, control instructions (conditionals, loops), composite types, functions and parameters, objects (encapsulation and abstraction, inheritance, polymorphism), inputs/outputs, streams, error and exception handling, template programming, move semantics, C++ STL, lambdas and functional programming, C++ API design, build engines, and solving interview problems.',
  6,
  'French',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Informatique'
  AND u.name = 'Université Saint-Joseph de Beyrouth';


  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 200',
  'Introduction to Computers & Programming',
  'This course provides students with a foundation of computing and algorithmic principles. It is intended to establish concrete skills in the constructs and algorithmic methods as an essential part of the software development process. Teaching is carried out by way of a lecture-and-homework agenda that emphasizes the design, construction, and analysis of algorithms, coupled to a lab-and-project agenda focused on the application of those principles in the use of software packages. Lecture-and-homework topics include: pseudo-language, algorithms, programming life cycle, procedural programming versus object-oriented programming, abstraction, objects and classes, decision constructs and repetition structures. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 203',
  'Functional Programming',
  'Programming with functions, top-down decomposition and stepwise refinement, higher-order functions, referential transparency, Lazy evaluation. The application language is LISP.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 206',
  'Principles of Programming',
  'This course is designed to introduce students to the concept of computing and programming principles. It is intended to establish concrete skills in the constructs and algorithmic methods as an essential part of the software development process. The topics include: algorithms, procedural programming, data representation, basic programming control structures (sequence, selection and repetition), functional decomposition, functions call and arrays. ',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 210',
  'Computer Organization and Assembly Language',
  'An introduction to computer organization and assembly programming covering the general structure of a microprocessor-based computer with detailed description of the data, address, and control buses used on the 8086 microprocessor. It also covers the assembly process and the instruction set of the 8086. In addition, it discusses I/ O and memory management',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 213',
  'Compiler Design & Construction',
  'Overview of compilers including component functions and classification. Symbol table construction and operations; lexical analysis, parsers, code generation, and error handling. Intermediate code generation and compiler generators',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 215',
  'Object Oriented Programming',
  'This is an advanced programming course. It covers the programming paradigms with examples, and the transition between modular programming and object-oriented programming. The course also covers data categorization and subdivision into classes and discusses inheritance of operations from one class to another. Topics include: Advanced Arrays, Files, object-oriented analysis and design, class abstraction, encapsulation, inheritance, polymorphism, Composition, Exception Handling, and Binary I/O.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 220',
  'Systems Programming',
  'The UNIX operating system is introduced as a programming environment. Topics include: the C language and libraries, history and overview of the UNIX operating system, the file structure, the shell, graphical user interfaces, the vi editor, programming the Bourne, the C and the Korn shell, UNIX utility programs, and UNIX networking.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 223',
  'Network Configuration & Programming',
  'This course provides a foundation of network administration including account administration, resource allocation and optimization, and service management. Strategies for maintaining robust and secure networks are explored. Topics include, but are not limited to: Network administration and configuration, network management (SNMP), network security, access controls, error correction, routing protocols, congestion control (TCP, UDP), selection of topics including DHCP, ICMP, VPNs, and multicast. Programming assignments include developing client and server software using sockets, RMI or CORBA',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 231',
  'Java Technology',
  'This course introduces Java as a technology and a development and deployment platform (J2SE). It provides students with the skills to create applications that leverage the object-oriented features of Java, such as encapsulation, inheritance, and polymorphism. The course introduces students to GUI programming, multithreading, networking, and event-driven programming using Java technology GUI components. Students will develop classes to connect to SQL database systems by using the core aspects of JDBC API. Other topics include: Exception handling, multi-threading, RMI, two-tier and three-tier Java technology applications',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

  INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  'CSIS 235',
  'Mobile Programming',
  'Mobile computing is a growing developed communication system in distributed networks. It is a part of HumanComputer Interaction where users interact with portable mobile devices. This course covers the fundamental concepts of mobile computing including mobile area overview, concentrations on problems and solutions in mobile networking, mobility and data management, service management, and security for mobile and wireless communication systems. Topics include mobile communication, protocols and data format, mobile devices and components, data and service management, characteristics of mobile applications, and security in mobile computing environments.',
  3,
  'English',
  'undergraduate',
  d.department_id
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE d.name = 'Computer Science'
  AND u.name = 'University of Balamand';

/* LIU Computer Engineering */

INSERT INTO department (name, university_id)
SELECT 'Computer and Communications Engineering', u.university_id
FROM university u
WHERE u.name = 'Lebanese International University'
  AND NOT EXISTS (
    SELECT 1
    FROM department d
    WHERE d.university_id = u.university_id
      AND d.name = 'Computer and Communications Engineering'
  );

UPDATE department d
JOIN university u ON u.university_id = d.university_id
SET d.is_active = 1
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering';

INSERT INTO major (department_id, name)
SELECT d.department_id, 'Computer Engineering'
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
ON DUPLICATE KEY UPDATE major_id = major_id;

INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  course_data.code,
  course_data.title,
  course_data.description,
  course_data.credits,
  course_data.language,
  course_data.level,
  d.department_id
FROM (
  SELECT 'CSCI250' AS code, 'Introduction to Programming' AS title, 'Introduces structured Java programming, including syntax, program structure, simple data types, control structures, methods, arrays, and strings.' AS description, 3 AS credits, 'English' AS language, 'undergraduate' AS level
  UNION ALL SELECT 'CSCI250L', 'Introduction to Programming Lab', 'A co-requisite lab for CSCI250 where students practice programming fundamentals through exercises using data types, selection, repetition, methods, and arrays.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CSCI300', 'Intermediate Programming with Objects', 'Emphasizes object-oriented programming in Java, including classes, objects, constructors, methods, dependency, aggregation, inheritance, polymorphism, exceptions, and file I/O.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGG200', 'Introduction to Engineering', 'Introduces engineering work, fundamental principles, structured design, team prototyping, and technical presentation skills.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGG300', 'Engineering Economics', 'Covers engineering economic decision-making, the impact of money on analysis, and environmental and social factors in practical engineering choices.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH210', 'Calculus II', 'Continues calculus with logarithmic, exponential, and trigonometric functions, integration techniques, improper integrals, sequences, series, and polar coordinates.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH220', 'Calculus III', 'Covers multivariable and vector calculus, including quadric surfaces, partial differentiation, multiple integration, and vector fields.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH225', 'Linear Algebra with Applications', 'Introduces vectors, systems of equations, matrices, determinants, vector spaces, transformations, eigenvalues, diagonalization, and orthogonality.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH270', 'Ordinary Differential Equations', 'Introduces ordinary differential equations and applications, including first and higher order equations, systems, series solutions, and Laplace transforms.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH310', 'Probability & Statistics for Scientists & Engineers', 'Develops probabilistic and statistical concepts with computational and analytic skills for scientific, engineering, and real-world applications.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'PHYS220', 'Physics for Engineers', 'Provides calculus-based physics for engineering students, including oscillations, mechanical waves, interference, reflection, refraction, and image formation.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG250', 'Digital Logic I', 'Introduces digital logic operations and design, including Boolean algebra, logic functions, minimization, number systems, arithmetic, and combinational circuits.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG325', 'Software Applications and Design', 'Introduces object-oriented application design and development, including implementation, debugging, testing, graphical interfaces, executable creation, UML, and socket programming basics.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG335', 'Digital Logic II', 'Extends digital logic into sequential circuits, including latches, flip-flops, state tables, state equations, Moore and Mealy machines, and hardware description languages.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG352L', 'Digital Logic Circuits Lab', 'Provides experiments in designing, simulating, and testing combinational and sequential digital circuits, including decoders, multiplexers, arithmetic circuits, and flip-flops.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG375', 'Introduction to Database Systems', 'Introduces database design and programming, including ER modeling, the relational model, SQL, Java database connectivity, normalization, transactions, and triggers.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG380', 'Microprocessors and Microcontrollers', 'Introduces microcontroller design and applications using AVR architecture, assembly and C programming, timers, interrupts, parallel I/O, and interfacing.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG400', 'Computer Organization and Design', 'Covers computer organization and digital design, including arithmetic, MIPS processor design, ALU, datapath and control, pipelining, hazards, interrupts, caches, and virtual memory.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG400L', 'Microcontroller Applications Lab', 'Covers Arduino microcontroller programming and hardware applications, including serial and parallel interfacing, C programming, Proteus simulation, and Atmel tools.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG415', 'Communication Networks', 'Introduces computer communication networks, protocols and applications, architectures, reliable transfer, transport, congestion and flow control, routing, data link protocols, addressing, and LANs.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG420', 'Web Programming and Technologies', 'Focuses on web application development with HTML, CSS, JavaScript, DOM, JQuery, PHP, AJAX, database connectivity, sessions, HTTP headers, security, and privacy.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG430L', 'Linux Lab', 'Teaches Linux and Python scripting for Raspberry Pi, with emphasis on automation, interfacing, and networking tasks.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG435', 'Mobile Application Development', 'Develops advanced Android applications, including environment setup, user interfaces, persistence, geolocation, media handling, networking, services, deployment, and mobile business trends.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG450L', 'Scripting Languages Lab', 'Introduces scientific and engineering scripting languages for modeling, simulation, analysis, and algorithmic problem solving.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG455L', 'Communication Networks Lab', 'Provides practical Internet networking experience using packet simulation and real LAN concepts, including switches, routers, IPv4/IPv6, WAN configuration, and client/server applications.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG495', 'Senior Project', 'A capstone project integrating topics from the curriculum through research, experimentation, implementation, technical writing, demonstration, and presentation.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG250', 'Electric Circuits I', 'Introduces electrical and electronics engineering circuit principles, including voltage, current, power, passive elements, Kirchhoff laws, node and mesh analysis, equivalent circuits, op-amps, and first-order responses.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG300', 'Electric Circuits II', 'Introduces AC circuit analysis with ideal and dependent sources, sinusoidal steady-state power, balanced three-phase circuits, and frequency selective circuits.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG301L', 'Electric Circuits Lab', 'Reinforces DC and AC circuit concepts through experiments using resistors, capacitors, inductors, transformers, op-amps, lab instruments, LTspice, filters, and op-amp applications.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG350', 'Electronic Circuits I', 'Covers semiconductors, P-N junctions, diode models and applications, BJT structure and biasing, small-signal BJT amplifiers, MOSFET structure, biasing, and amplifiers.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG350L', 'Electronic Circuits I Lab', 'Provides experiments for designing, building, and testing diode, BJT, and MOSFET circuits and amplifier configurations.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG385', 'Signals and Systems', 'Introduces signals and systems, time and frequency domain analysis, LTI systems, Fourier series, Fourier transform, and Laplace transform applications.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG447', 'Analog Communication Systems', 'Covers analog communication principles, linear systems, modulation, spectral density, random signals, noise models, demodulation, and noise effects.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG467L', 'Analog Communication Systems Lab', 'Uses LabVIEW and radio hardware to design, simulate, and test analog communication systems and modulation schemes in time and frequency domains.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'ARAB200', 'Arabic Language and Literature', 'Develops Arabic language and literature skills for non-specialists through grammar, morphology, rhetoric, literary analysis, expression, and communication techniques.', 3, 'Arabic', 'undergraduate'
  UNION ALL SELECT 'CULT200', 'Introduction to Arab - Islamic Civilization', 'Introduces Arab-Islamic civilization, its historical, scientific, cultural, and intellectual achievements, and its relevance to civilizational awareness.', 3, 'Arabic', 'undergraduate'
  UNION ALL SELECT 'ENGG450', 'Engineering Ethics and Professional Practice', 'Studies ethical theories and professional engineering responsibilities, including safety, risk, liability, employee rights, codes of ethics, legal duties, environmental responsibility, and case analysis.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGL201', 'Composition and Research Skills', 'Builds critical thinking and academic writing through reading, text response, research, analysis, and production of a research paper.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGL251', 'Communication Skills', 'Develops workplace and technical communication, editing, and professional writing through analysis and practice with workplace writing models.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'GE*****', 'General Education Elective', 'A student-selected general education elective used to complete the LIU Computer Engineering curriculum requirements.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG460', 'Operating Systems', 'Introduces operating systems at user, application, design, and implementation levels, including structure, process management, scheduling, threads, IPC, deadlocks, synchronization, protection, memory management, and hands-on programming.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG470', 'Data Structures and Analysis of Algorithms', 'Introduces stacks, queues, lists, trees, graphs, abstraction, sorting, searching, selection, worst and average case analysis, recurrences, asymptotic analysis, divide-and-conquer, and greedy algorithms.', 3, 'English', 'undergraduate'
) AS course_data
JOIN department d ON d.name = 'Computer and Communications Engineering'
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  credits = VALUES(credits),
  language = VALUES(language),
  level = VALUES(level);

UPDATE course c
JOIN department d ON d.department_id = c.department_id
JOIN university u ON u.university_id = d.university_id
JOIN (
  SELECT 'CULT200' AS code, 'This course introduces students to the history, culture, philosophy, and scientific achievements of Arab-Islamic civilization. It explores the development of Islamic societies and their contributions to science, literature, mathematics, and architecture, while also discussing the civilization impact on the modern world.' AS description
  UNION ALL SELECT 'MATH225', 'Students learn the fundamentals of linear algebra including matrices, determinants, vectors, eigenvalues, and systems of linear equations. The course emphasizes engineering applications such as computer graphics, circuit analysis, data processing, and machine learning foundations.'
  UNION ALL SELECT 'ENGL201', 'This course develops academic writing and research abilities. Students practice essay writing, technical reports, research documentation, referencing styles, and critical reading. It also strengthens grammar, vocabulary, and communication skills needed in university-level engineering studies.'
  UNION ALL SELECT 'ENGG200', 'An introductory engineering course covering engineering disciplines, problem-solving methods, ethics, teamwork, and project-based thinking. Students are exposed to the engineering design process and gain a basic understanding of how engineering solutions are developed in real-world industries.'
  UNION ALL SELECT 'PHYS220', 'Covers fundamental physics concepts important for engineering students including mechanics, energy, motion, electricity, magnetism, and waves. The course focuses on applying physical laws to engineering systems and practical problem-solving.'
  UNION ALL SELECT 'MATH210', 'A continuation of Calculus I focusing on integration techniques, applications of integration, sequences, infinite series, and differential equations. Engineering applications are emphasized throughout the course.'
  UNION ALL SELECT 'CSCI250L', 'A practical laboratory course accompanying introductory programming. Students implement programming concepts through coding exercises, debugging, problem-solving, and software development tasks.'
  UNION ALL SELECT 'MATH270', 'Introduces methods for solving ordinary differential equations and modeling engineering systems. Topics include first-order and higher-order differential equations, Laplace transforms, and applications in electrical and mechanical systems.'
  UNION ALL SELECT 'CSCI250', 'Introduces programming fundamentals using a high-level programming language. Students learn variables, loops, conditions, functions, arrays, algorithms, and problem-solving techniques used in software development.'
  UNION ALL SELECT 'EENG250', 'Covers the fundamentals of electrical circuits including Ohm''s Law, Kirchhoff''s laws, voltage and current analysis, resistive circuits, and circuit theorems. Students analyze and solve basic electrical engineering problems.'
  UNION ALL SELECT 'CENG250', 'Introduces digital systems and binary logic. Topics include Boolean algebra, logic gates, combinational circuits, number systems, and digital circuit design fundamentals.'
  UNION ALL SELECT 'MATH220', 'Focuses on multivariable calculus including vectors, partial derivatives, multiple integration, vector fields, and applications in engineering and physics.'
  UNION ALL SELECT 'ARAB200', 'Develops Arabic language proficiency while introducing students to classical and modern Arabic literature, writing styles, and cultural expression.'
  UNION ALL SELECT 'ENGL251', 'Enhances oral and written communication skills for professional and academic environments. Students practice presentations, technical communication, teamwork discussions, and professional reporting.'
  UNION ALL SELECT 'CSCI300', 'Introduces object-oriented programming concepts such as classes, inheritance, polymorphism, encapsulation, and abstraction. Students build structured and reusable software applications.'
  UNION ALL SELECT 'EENG300', 'Advanced circuit analysis involving capacitors, inductors, transient response, AC circuits, frequency response, and power analysis.'
  UNION ALL SELECT 'MATH310', 'Covers probability theory, statistical analysis, random variables, distributions, hypothesis testing, and engineering data interpretation.'
  UNION ALL SELECT 'CENG335', 'Advanced digital system design including sequential circuits, counters, registers, finite state machines, memory devices, and programmable logic systems.'
  UNION ALL SELECT 'CENG325', 'Focuses on software engineering principles, application development, software architecture, user interface design, testing, and software lifecycle management.'
  UNION ALL SELECT 'EENG301L', 'Laboratory experiments related to circuit analysis, measurement instruments, AC and DC circuits, and verification of electrical engineering theories.'
  UNION ALL SELECT 'EENG350L', 'Practical experiments involving electronic components such as diodes, transistors, amplifiers, and operational amplifiers.'
  UNION ALL SELECT 'ENGG300', 'Introduces economic analysis techniques for engineering projects including cost estimation, depreciation, interest calculations, investment analysis, and project evaluation.'
  UNION ALL SELECT 'CENG352L', 'Hands-on laboratory work in digital electronics including circuit implementation, simulation, FPGA basics, and troubleshooting digital systems.'
  UNION ALL SELECT 'EENG385', 'Covers continuous and discrete-time signals, system analysis, Fourier transforms, convolution, and signal processing fundamentals.'
  UNION ALL SELECT 'CENG375', 'Introduces database concepts including relational databases, SQL programming, normalization, entity-relationship modeling, and database management systems.'
  UNION ALL SELECT 'CENG380', 'Studies computer hardware interfaces and embedded systems. Topics include assembly language, microcontroller architecture, memory systems, I/O interfacing, and embedded programming.'
  UNION ALL SELECT 'EENG350', 'Covers semiconductor devices, diodes, transistors, amplifiers, operational amplifiers, and electronic circuit analysis.'
  UNION ALL SELECT 'CENG430L', 'Practical training in Linux operating systems including shell commands, scripting, file systems, process management, networking tools, and system administration basics.'
  UNION ALL SELECT 'EENG447', 'Introduces analog communication concepts including modulation, demodulation, signal transmission, noise analysis, and communication system performance.'
  UNION ALL SELECT 'CENG415', 'Covers computer networking concepts such as network architectures, TCP/IP, routing, switching, wireless networks, network security, and internet protocols.'
  UNION ALL SELECT 'CENG420', 'Focuses on front-end and back-end web development using web technologies such as HTML, CSS, JavaScript, databases, and server-side programming.'
  UNION ALL SELECT 'CENG400L', 'Laboratory applications of embedded systems and microcontrollers including sensor interfacing, hardware control, and real-time embedded programming.'
  UNION ALL SELECT 'CENG400', 'Explores computer architecture including CPU design, memory hierarchy, instruction sets, assembly language, pipelining, and hardware-software interaction.'
  UNION ALL SELECT 'CENG435', 'Introduces mobile app development for Android or iOS platforms. Topics include UI design, mobile programming, APIs, databases, and app deployment.'
  UNION ALL SELECT 'CENG450L', 'Practical use of scripting languages such as Python, Bash, or Perl for automation, system tasks, and software tools development.'
  UNION ALL SELECT 'CENG455L', 'Hands-on networking experiments including router configuration, network protocols, packet analysis, and network troubleshooting.'
  UNION ALL SELECT 'CENG495', 'A capstone engineering project where students design and implement a complete hardware and software solution. The course emphasizes research, teamwork, technical documentation, and presentation skills.'
  UNION ALL SELECT 'EENG467L', 'Laboratory experiments related to analog communication systems, modulation techniques, signal analysis, and communication hardware.'
  UNION ALL SELECT 'ENGG450', 'Discusses engineering ethics, legal responsibilities, professional conduct, sustainability, teamwork, and workplace practices for engineers.'
  UNION ALL SELECT 'CENG460', 'Introduces operating system concepts including process management, memory management, file systems, scheduling, synchronization, and system security.'
  UNION ALL SELECT 'CENG470', 'Covers advanced data structures such as linked lists, stacks, queues, trees, graphs, and algorithm analysis including sorting, searching, recursion, and computational complexity.'
) AS course_descriptions ON course_descriptions.code = c.code
SET c.description = course_descriptions.description
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering';

INSERT INTO roadmap (
  major_id,
  level,
  title,
  total_credits,
  is_published,
  created_by
)
SELECT
  m.major_id,
  'undergraduate',
  'Computer Engineering Undergraduate Roadmap',
  108,
  1,
  NULL
FROM major m
JOIN department d ON d.department_id = m.department_id
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
  AND m.name = 'Computer Engineering'
ON DUPLICATE KEY UPDATE
  roadmap_id = roadmap_id;

INSERT IGNORE INTO roadmap_course (
  roadmap_id,
  course_id,
  year_number,
  semester,
  sequence_order
)
SELECT
  r.roadmap_id,
  c.course_id,
  roadmap_data.year_number,
  roadmap_data.semester,
  roadmap_data.sequence_order
FROM (
  SELECT 'CSCI250' AS code, 1 AS year_number, 'fall' AS semester, 1 AS sequence_order
  UNION ALL SELECT 'CSCI250L', 1, 'fall', 2
  UNION ALL SELECT 'ENGG200', 1, 'fall', 3
  UNION ALL SELECT 'MATH210', 1, 'fall', 4
  UNION ALL SELECT 'PHYS220', 1, 'fall', 5
  UNION ALL SELECT 'ENGL201', 1, 'fall', 6
  UNION ALL SELECT 'CSCI300', 1, 'spring', 1
  UNION ALL SELECT 'CENG250', 1, 'spring', 2
  UNION ALL SELECT 'EENG250', 1, 'spring', 3
  UNION ALL SELECT 'MATH220', 1, 'spring', 4
  UNION ALL SELECT 'MATH225', 1, 'spring', 5
  UNION ALL SELECT 'ENGL251', 1, 'spring', 6
  UNION ALL SELECT 'ARAB200', 1, 'summer', 1
  UNION ALL SELECT 'CULT200', 1, 'summer', 2
  UNION ALL SELECT 'GE*****', 1, 'summer', 3
  UNION ALL SELECT 'CENG325', 2, 'fall', 1
  UNION ALL SELECT 'CENG335', 2, 'fall', 2
  UNION ALL SELECT 'CENG352L', 2, 'fall', 3
  UNION ALL SELECT 'EENG300', 2, 'fall', 4
  UNION ALL SELECT 'EENG301L', 2, 'fall', 5
  UNION ALL SELECT 'MATH270', 2, 'fall', 6
  UNION ALL SELECT 'MATH310', 2, 'fall', 7
  UNION ALL SELECT 'CENG375', 2, 'spring', 1
  UNION ALL SELECT 'CENG380', 2, 'spring', 2
  UNION ALL SELECT 'EENG350', 2, 'spring', 3
  UNION ALL SELECT 'EENG350L', 2, 'spring', 4
  UNION ALL SELECT 'EENG385', 2, 'spring', 5
  UNION ALL SELECT 'ENGG300', 2, 'spring', 6
  UNION ALL SELECT 'CENG400L', 2, 'summer', 1
  UNION ALL SELECT 'CENG430L', 2, 'summer', 2
  UNION ALL SELECT 'CENG470', 2, 'summer', 3
  UNION ALL SELECT 'CENG400', 3, 'fall', 1
  UNION ALL SELECT 'CENG415', 3, 'fall', 2
  UNION ALL SELECT 'CENG420', 3, 'fall', 3
  UNION ALL SELECT 'CENG450L', 3, 'fall', 4
  UNION ALL SELECT 'EENG447', 3, 'fall', 5
  UNION ALL SELECT 'EENG467L', 3, 'fall', 6
  UNION ALL SELECT 'CENG435', 3, 'spring', 1
  UNION ALL SELECT 'CENG455L', 3, 'spring', 2
  UNION ALL SELECT 'CENG460', 3, 'spring', 3
  UNION ALL SELECT 'ENGG450', 3, 'spring', 4
  UNION ALL SELECT 'CENG495', 3, 'summer', 1
) AS roadmap_data
JOIN course c ON c.code = roadmap_data.code
JOIN department course_department
  ON course_department.department_id = c.department_id
JOIN university course_university
  ON course_university.university_id = course_department.university_id
JOIN major m ON m.name = 'Computer Engineering'
JOIN department major_department
  ON major_department.department_id = m.department_id
JOIN university major_university
  ON major_university.university_id = major_department.university_id
JOIN roadmap r
  ON r.major_id = m.major_id
  AND r.level = 'undergraduate'
WHERE course_university.name = 'Lebanese International University'
  AND course_department.name = 'Computer and Communications Engineering'
  AND major_university.name = 'Lebanese International University'
  AND major_department.name = 'Computer and Communications Engineering'
  AND c.deleted_at IS NULL
ORDER BY
  roadmap_data.year_number,
  FIELD(roadmap_data.semester, 'fall', 'spring', 'summer'),
  roadmap_data.sequence_order;

/* LIU Computer Engineering prerequisite relationships. */
INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  course_data.code,
  course_data.title,
  course_data.description,
  course_data.credits,
  course_data.language,
  course_data.level,
  d.department_id
FROM (
  SELECT 'MATH160' AS code, 'Pre-Calculus' AS title, 'Builds algebraic, trigonometric, and analytic geometry skills needed for calculus and engineering coursework.' AS description, 3 AS credits, 'English' AS language, 'freshman' AS level
  UNION ALL SELECT 'MATH161', 'Calculus I', 'Introduces limits, derivatives, integrals, and applications of single-variable calculus for science and engineering.', 3, 'English', 'freshman'
  UNION ALL SELECT 'ENGL051', 'English Foundations', 'Develops foundational English reading, grammar, vocabulary, and writing skills for university-level study.', 3, 'English', 'freshman'
  UNION ALL SELECT 'ENGL101', 'English I', 'Builds academic English skills through reading, paragraph writing, grammar practice, and structured communication.', 3, 'English', 'freshman'
  UNION ALL SELECT 'ENGL151', 'English II', 'Continues academic English development with essay writing, critical reading, vocabulary, and clear written expression.', 3, 'English', 'freshman'
  UNION ALL SELECT 'CHEM160', 'General Chemistry', 'Introduces general chemistry concepts including atomic structure, bonding, reactions, stoichiometry, gases, solutions, and laboratory-related problem solving.', 3, 'English', 'freshman'
  UNION ALL SELECT 'PHYS160', 'Physics I', 'Introduces mechanics-based physics concepts including motion, forces, energy, momentum, rotation, and applications for engineering students.', 3, 'English', 'freshman'
  UNION ALL SELECT 'PHYS161', 'Physics I Lab', 'Provides laboratory experiments that reinforce Physics I topics through measurement, data analysis, uncertainty, and scientific reporting.', 1, 'English', 'freshman'
) AS course_data
JOIN department d ON d.name = 'Computer and Communications Engineering'
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  credits = VALUES(credits),
  language = VALUES(language),
  level = VALUES(level),
  deleted_at = NULL;

INSERT INTO roadmap (
  major_id,
  level,
  title,
  total_credits,
  is_published,
  created_by
)
SELECT
  m.major_id,
  'freshman',
  'Computer Engineering Freshman Prerequisite Roadmap',
  22,
  1,
  NULL
FROM major m
JOIN department d ON d.department_id = m.department_id
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
  AND m.name = 'Computer Engineering'
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  total_credits = VALUES(total_credits),
  is_published = 1;

INSERT INTO roadmap_course (
  roadmap_id,
  course_id,
  year_number,
  semester,
  sequence_order
)
SELECT
  r.roadmap_id,
  c.course_id,
  roadmap_data.year_number,
  roadmap_data.semester,
  roadmap_data.sequence_order
FROM (
  SELECT 'MATH160' AS code, 1 AS year_number, 'fall' AS semester, 10 AS sequence_order
  UNION ALL SELECT 'ENGL051', 1, 'fall', 20
  UNION ALL SELECT 'CHEM160', 1, 'fall', 30
  UNION ALL SELECT 'PHYS160', 1, 'fall', 40
  UNION ALL SELECT 'MATH161', 1, 'spring', 10
  UNION ALL SELECT 'ENGL101', 1, 'spring', 20
  UNION ALL SELECT 'ENGL151', 1, 'spring', 30
  UNION ALL SELECT 'PHYS161', 1, 'spring', 40
) AS roadmap_data
JOIN course c ON c.code = roadmap_data.code
JOIN department course_department
  ON course_department.department_id = c.department_id
JOIN university course_university
  ON course_university.university_id = course_department.university_id
JOIN major m ON m.name = 'Computer Engineering'
JOIN department major_department
  ON major_department.department_id = m.department_id
JOIN university major_university
  ON major_university.university_id = major_department.university_id
JOIN roadmap r
  ON r.major_id = m.major_id
  AND r.level = 'freshman'
WHERE course_university.name = 'Lebanese International University'
  AND course_department.name = 'Computer and Communications Engineering'
  AND major_university.name = 'Lebanese International University'
  AND major_department.name = 'Computer and Communications Engineering'
  AND c.deleted_at IS NULL
ON DUPLICATE KEY UPDATE
  year_number = VALUES(year_number),
  semester = VALUES(semester),
  sequence_order = VALUES(sequence_order);

INSERT IGNORE INTO course_prerequisite (course_id, prereq_course_id)
SELECT
  target.course_id,
  prereq.course_id
FROM (
  SELECT 'MATH225' AS course_code, 'MATH160' AS prereq_code
  UNION ALL SELECT 'MATH225', 'ENGL051'
  UNION ALL SELECT 'MATH225', 'MATH161'
  UNION ALL SELECT 'ENGL201', 'ENGL151'
  UNION ALL SELECT 'ENGG200', 'MATH160'
  UNION ALL SELECT 'ENGG200', 'CHEM160'
  UNION ALL SELECT 'PHYS220', 'PHYS161'
  UNION ALL SELECT 'PHYS220', 'ENGL101'
  UNION ALL SELECT 'PHYS220', 'PHYS160'
  UNION ALL SELECT 'MATH210', 'MATH161'
  UNION ALL SELECT 'MATH210', 'MATH160'
  UNION ALL SELECT 'CSCI250L', 'ENGL101'
  UNION ALL SELECT 'MATH270', 'MATH210'
  UNION ALL SELECT 'CSCI250', 'ENGL101'
  UNION ALL SELECT 'EENG250', 'PHYS161'
  UNION ALL SELECT 'EENG250', 'PHYS160'
  UNION ALL SELECT 'EENG250', 'MATH161'
  UNION ALL SELECT 'EENG250', 'MATH160'
  UNION ALL SELECT 'EENG250', 'ENGL051'
  UNION ALL SELECT 'CENG250', 'EENG250'
  UNION ALL SELECT 'MATH220', 'MATH210'
  UNION ALL SELECT 'ENGL251', 'ENGL201'
  UNION ALL SELECT 'CSCI300', 'CSCI250L'
  UNION ALL SELECT 'CSCI300', 'CSCI250'
  UNION ALL SELECT 'EENG300', 'EENG250'
  UNION ALL SELECT 'MATH310', 'MATH210'
  UNION ALL SELECT 'MATH310', 'ENGL201'
  UNION ALL SELECT 'CENG335', 'CSCI250'
  UNION ALL SELECT 'CENG335', 'CENG250'
  UNION ALL SELECT 'CENG325', 'CSCI300'
  UNION ALL SELECT 'EENG301L', 'EENG250'
  UNION ALL SELECT 'EENG350L', 'EENG300'
  UNION ALL SELECT 'EENG350L', 'EENG250'
  UNION ALL SELECT 'EENG350L', 'EENG301L'
  UNION ALL SELECT 'ENGG300', 'ENGL201'
  UNION ALL SELECT 'ENGG300', 'MATH225'
  UNION ALL SELECT 'CENG352L', 'CENG250'
  UNION ALL SELECT 'CENG352L', 'EENG301L'
  UNION ALL SELECT 'EENG385', 'MATH225'
  UNION ALL SELECT 'EENG385', 'EENG300'
  UNION ALL SELECT 'CENG375', 'CENG325'
  UNION ALL SELECT 'CENG375', 'CSCI300'
  UNION ALL SELECT 'CENG380', 'CENG250'
  UNION ALL SELECT 'CENG380', 'CENG335'
  UNION ALL SELECT 'CENG380', 'EENG250'
  UNION ALL SELECT 'CENG380', 'CSCI250'
  UNION ALL SELECT 'EENG350', 'ENGG200'
  UNION ALL SELECT 'EENG350', 'CENG250'
  UNION ALL SELECT 'EENG350', 'EENG300'
  UNION ALL SELECT 'EENG350', 'EENG250'
  UNION ALL SELECT 'CENG430L', 'CENG380'
  UNION ALL SELECT 'CENG430L', 'CENG325'
  UNION ALL SELECT 'EENG447', 'MATH310'
  UNION ALL SELECT 'EENG447', 'EENG385'
  UNION ALL SELECT 'CENG415', 'CENG250'
  UNION ALL SELECT 'CENG415', 'CENG325'
  UNION ALL SELECT 'CENG415', 'CSCI250'
  UNION ALL SELECT 'CENG415', 'CSCI300'
  UNION ALL SELECT 'CENG420', 'CENG325'
  UNION ALL SELECT 'CENG420', 'CSCI300'
  UNION ALL SELECT 'CENG420', 'CENG375'
  UNION ALL SELECT 'CENG400L', 'CENG380'
  UNION ALL SELECT 'CENG400', 'CENG335'
  UNION ALL SELECT 'CENG400', 'CENG250'
  UNION ALL SELECT 'CENG400', 'CENG380'
  UNION ALL SELECT 'CENG435', 'CENG325'
  UNION ALL SELECT 'CENG435', 'CSCI300'
  UNION ALL SELECT 'CENG435', 'CENG375'
  UNION ALL SELECT 'CENG450L', 'CENG430L'
  UNION ALL SELECT 'CENG455L', 'CENG415'
  UNION ALL SELECT 'CENG495', 'CENG420'
  UNION ALL SELECT 'CENG495', 'EENG350'
  UNION ALL SELECT 'CENG495', 'EENG447'
  UNION ALL SELECT 'CENG495', 'CENG435'
  UNION ALL SELECT 'CENG495', 'CENG415'
  UNION ALL SELECT 'CENG495', 'CENG380'
  UNION ALL SELECT 'CENG495', 'CENG375'
  UNION ALL SELECT 'EENG467L', 'EENG447'
  UNION ALL SELECT 'ENGG450', 'ENGG300'
  UNION ALL SELECT 'ENGG450', 'ENGL251'
  UNION ALL SELECT 'CENG460', 'CENG380'
  UNION ALL SELECT 'CENG460', 'CSCI300'
  UNION ALL SELECT 'CENG470', 'CENG325'
  UNION ALL SELECT 'CENG470', 'CSCI300'
) AS prereq_data
JOIN course target
  ON target.code = prereq_data.course_code
JOIN department target_department
  ON target_department.department_id = target.department_id
JOIN university target_university
  ON target_university.university_id = target_department.university_id
JOIN course prereq
  ON prereq.code = prereq_data.prereq_code
JOIN department prereq_department
  ON prereq_department.department_id = prereq.department_id
JOIN university prereq_university
  ON prereq_university.university_id = prereq_department.university_id
WHERE target_university.name = 'Lebanese International University'
  AND target_department.name = 'Computer and Communications Engineering'
  AND prereq_university.name = 'Lebanese International University'
  AND prereq_department.name = 'Computer and Communications Engineering'
  AND target.deleted_at IS NULL
  AND prereq.deleted_at IS NULL;

/*  5) GENERATED MAJORS AND STARTER ROADMAPS */

/*
  The rows below give every seeded computer-science department a matching major
  and a starter roadmap built from that department's existing courses. These are
  catalog-complete for the courses in this seed file, but they are not official
  university term plans unless the school data above already provided one.
*/
DROP TEMPORARY TABLE IF EXISTS tmp_catalog_major_seed;
CREATE TEMPORARY TABLE tmp_catalog_major_seed (
  university_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  major_name VARCHAR(255) NOT NULL,
  roadmap_title VARCHAR(255) NOT NULL,
  PRIMARY KEY (university_name, department_name, major_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_catalog_major_seed (
  university_name,
  department_name,
  major_name,
  roadmap_title
) VALUES
  ('Beirut Arab University', 'Mathematics and Computer Science', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('American University of Beirut', 'Computer Science', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('Lebanese American University', 'Computer Science and Mathematics', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('Lebanese International University', 'Computer Science and Information Technology', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('Université Saint-Joseph de Beyrouth', 'Informatique', 'Informatique', 'Informatique Undergraduate Roadmap'),
  ('University of Balamand', 'Computer Science', 'Computer Science', 'Computer Science Undergraduate Roadmap');

INSERT INTO major (department_id, name)
SELECT
  d.department_id,
  seed.major_name
FROM tmp_catalog_major_seed seed
JOIN university u ON u.name = seed.university_name
JOIN department d
  ON d.university_id = u.university_id
  AND d.name = seed.department_name
ON DUPLICATE KEY UPDATE major_id = major_id;

INSERT INTO roadmap (
  major_id,
  level,
  title,
  total_credits,
  is_published,
  created_by
)
SELECT
  m.major_id,
  'undergraduate',
  seed.roadmap_title,
  COALESCE(SUM(c.credits), 0),
  1,
  NULL
FROM tmp_catalog_major_seed seed
JOIN university u ON u.name = seed.university_name
JOIN department d
  ON d.university_id = u.university_id
  AND d.name = seed.department_name
JOIN major m
  ON m.department_id = d.department_id
  AND m.name = seed.major_name
JOIN course c
  ON c.department_id = d.department_id
  AND c.deleted_at IS NULL
GROUP BY
  m.major_id,
  seed.roadmap_title
HAVING COUNT(c.course_id) > 0
ON DUPLICATE KEY UPDATE
  roadmap_id = roadmap_id;

SET @catalog_key := '';
SET @catalog_rank := 0;

INSERT IGNORE INTO roadmap_course (
  roadmap_id,
  course_id,
  year_number,
  semester,
  sequence_order
)
SELECT
  r.roadmap_id,
  numbered.course_id,
  FLOOR((numbered.rank_number - 1) / 10) + 1 AS year_number,
  CASE
    WHEN MOD(FLOOR((numbered.rank_number - 1) / 5), 2) = 0 THEN 'fall'
    ELSE 'spring'
  END AS semester,
  MOD(numbered.rank_number - 1, 5) + 1 AS sequence_order
FROM (
  SELECT
    ranked.course_id,
    ranked.major_id,
    ranked.rank_number
  FROM (
    SELECT
      ordered.course_id,
      ordered.major_id,
      @catalog_rank := IF(@catalog_key = ordered.catalog_key, @catalog_rank + 1, 1) AS rank_number,
      @catalog_key := ordered.catalog_key AS assigned_catalog_key
    FROM (
      SELECT
        c.course_id,
        m.major_id,
        CONCAT(u.university_id, ':', d.department_id, ':', m.major_id) AS catalog_key,
        u.name AS university_name,
        d.name AS department_name,
        m.name AS major_name,
        c.level,
        c.code
      FROM tmp_catalog_major_seed seed
      JOIN university u ON u.name = seed.university_name
      JOIN department d
        ON d.university_id = u.university_id
        AND d.name = seed.department_name
      JOIN major m
        ON m.department_id = d.department_id
        AND m.name = seed.major_name
      JOIN course c
        ON c.department_id = d.department_id
        AND c.deleted_at IS NULL
      ORDER BY
        u.name ASC,
        d.name ASC,
        m.name ASC,
        FIELD(c.level, 'freshman', 'undergraduate', 'graduate', 'master_degree', 'doctoral') ASC,
        c.code ASC,
        c.course_id ASC
    ) ordered
  ) ranked
) numbered
JOIN roadmap r
  ON r.major_id = numbered.major_id
  AND r.level = 'undergraduate';

DROP TEMPORARY TABLE IF EXISTS tmp_catalog_major_seed;

/*  6) REALISTIC DEPARTMENTS, MAJORS, COURSES, AND ROADMAPS */

-- BEGIN CATALOG EXPANSION
DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_department_seed;
CREATE TEMPORARY TABLE tmp_full_catalog_department_seed (
  university_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  department_kind VARCHAR(50) NOT NULL,
  PRIMARY KEY (university_name, department_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
) VALUES
  ('Beirut Arab University', 'Mathematics and Computer Science', 'computing'),
  ('Beirut Arab University', 'Engineering', 'engineering'),
  ('Beirut Arab University', 'Business Administration', 'business'),
  ('American University of Beirut', 'Computer Science', 'computing'),
  ('American University of Beirut', 'Engineering', 'engineering'),
  ('American University of Beirut', 'Business', 'business'),
  ('Lebanese American University', 'Computer Science and Mathematics', 'computing'),
  ('Lebanese American University', 'Engineering', 'engineering'),
  ('Lebanese American University', 'Business', 'business'),
  ('Lebanese International University', 'Computer Science and Information Technology', 'computing'),
  ('Lebanese International University', 'Engineering', 'engineering'),
  ('Lebanese International University', 'Business', 'business'),
  ('Université Saint-Joseph de Beyrouth', 'Informatique', 'computing'),
  ('Université Saint-Joseph de Beyrouth', 'Engineering', 'engineering'),
  ('Université Saint-Joseph de Beyrouth', 'Business and Management', 'business'),
  ('University of Balamand', 'Computer Science', 'computing'),
  ('University of Balamand', 'Engineering', 'engineering'),
  ('University of Balamand', 'Business and Management', 'business');

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
)
SELECT u.name, 'Computer Science', 'computing'
FROM university u
WHERE u.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM tmp_full_catalog_department_seed seed
    WHERE seed.university_name = u.name
      AND seed.department_kind = 'computing'
  );

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
)
SELECT u.name, 'Engineering', 'engineering'
FROM university u
WHERE u.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM tmp_full_catalog_department_seed seed
    WHERE seed.university_name = u.name
      AND seed.department_kind = 'engineering'
  );

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
)
SELECT u.name, 'Business', 'business'
FROM university u
WHERE u.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM tmp_full_catalog_department_seed seed
    WHERE seed.university_name = u.name
      AND seed.department_kind = 'business'
  );

INSERT INTO department (name, university_id)
SELECT
  seed.department_name,
  u.university_id
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
WHERE NOT EXISTS (
  SELECT 1
  FROM department existing_department
  WHERE existing_department.university_id = u.university_id
    AND LOWER(existing_department.name) = LOWER(seed.department_name)
);

DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_major_template;
CREATE TEMPORARY TABLE tmp_full_catalog_major_template (
  department_kind VARCHAR(50) NOT NULL,
  major_name VARCHAR(255) NOT NULL,
  roadmap_title VARCHAR(255) NOT NULL,
  PRIMARY KEY (department_kind, major_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_full_catalog_major_template (
  department_kind,
  major_name,
  roadmap_title
) VALUES
  ('computing', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('computing', 'Data Science', 'Data Science Undergraduate Roadmap'),
  ('engineering', 'Computer Engineering', 'Computer Engineering Undergraduate Roadmap'),
  ('engineering', 'Civil Engineering', 'Civil Engineering Undergraduate Roadmap'),
  ('business', 'Business Administration', 'Business Administration Undergraduate Roadmap'),
  ('business', 'Finance', 'Finance Undergraduate Roadmap');

INSERT INTO major (department_id, name)
SELECT
  d.department_id,
  major_template.major_name
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_major_template major_template
  ON major_template.department_kind = seed.department_kind
WHERE NOT EXISTS (
  SELECT 1
  FROM major existing_major
  WHERE existing_major.department_id = d.department_id
    AND LOWER(existing_major.name) = LOWER(major_template.major_name)
);

DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_course_template;
CREATE TEMPORARY TABLE tmp_full_catalog_course_template (
  department_kind VARCHAR(50) NOT NULL,
  major_name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  credits TINYINT UNSIGNED NOT NULL,
  language VARCHAR(20) NOT NULL,
  level VARCHAR(32) NOT NULL,
  year_number TINYINT UNSIGNED NOT NULL,
  semester VARCHAR(20) NOT NULL,
  sequence_order SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (department_kind, major_name, code)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_full_catalog_course_template (
  department_kind,
  major_name,
  code,
  title,
  description,
  credits,
  language,
  level,
  year_number,
  semester,
  sequence_order
) VALUES
  ('computing', 'Computer Science', 'CS 101', 'Introduction to Programming', 'Introduces problem solving, program structure, variables, control flow, functions, arrays, and debugging through practical programming exercises.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('computing', 'Computer Science', 'CS 201', 'Data Structures', 'Covers lists, stacks, queues, trees, hashing, recursion, sorting, searching, and algorithmic analysis for software development.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('computing', 'Computer Science', 'CS 301', 'Database Systems', 'Introduces relational modeling, SQL, normalization, transactions, indexing, and application-level database design.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('computing', 'Computer Science', 'CS 320', 'Software Engineering', 'Covers requirements, design, implementation, testing, version control, teamwork, and maintainable software project delivery.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('computing', 'Data Science', 'DS 201', 'Data Analytics', 'Introduces data collection, cleaning, descriptive analytics, visualization, and reproducible analysis with practical data sets.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('computing', 'Data Science', 'DS 220', 'Probability for Data Science', 'Covers probability models, random variables, distributions, sampling, estimation, and uncertainty for data-driven decisions.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('computing', 'Data Science', 'DS 310', 'Machine Learning', 'Introduces supervised and unsupervised learning, model evaluation, regression, classification, clustering, and applied machine-learning workflows.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('computing', 'Data Science', 'DS 330', 'Data Visualization', 'Covers visual encoding, dashboard design, exploratory graphics, storytelling with data, and interactive visualization tools.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('engineering', 'Computer Engineering', 'ENGR 101', 'Introduction to Engineering', 'Introduces engineering disciplines, design thinking, technical communication, ethics, teamwork, and project-based problem solving.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('engineering', 'Computer Engineering', 'ENGR 210', 'Engineering Mathematics', 'Builds mathematical foundations for engineering, including calculus applications, vectors, matrices, and differential equations.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('engineering', 'Computer Engineering', 'CENG 220', 'Digital Logic', 'Covers number systems, Boolean algebra, logic gates, combinational circuits, flip-flops, registers, and sequential logic design.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('engineering', 'Computer Engineering', 'CENG 320', 'Computer Organization', 'Studies processor datapaths, instruction sets, memory hierarchy, assembly basics, input/output, and hardware/software interaction.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('engineering', 'Civil Engineering', 'CIVE 201', 'Engineering Mechanics', 'Introduces statics, force systems, equilibrium, trusses, frames, friction, centroids, and moments of inertia.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('engineering', 'Civil Engineering', 'CIVE 220', 'Surveying', 'Covers measurement, leveling, traversing, mapping, coordinate systems, site data, and field surveying practice.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('engineering', 'Civil Engineering', 'CIVE 310', 'Structural Analysis', 'Develops analysis of beams, frames, trusses, influence lines, deflection, and structural behavior under loads.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('engineering', 'Civil Engineering', 'CIVE 330', 'Construction Materials', 'Studies concrete, steel, asphalt, timber, aggregates, testing methods, specifications, and material selection in construction.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('business', 'Business Administration', 'BUS 101', 'Principles of Management', 'Introduces planning, organizing, leadership, control, decision making, organizational structure, and management in contemporary workplaces.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('business', 'Business Administration', 'BUS 220', 'Organizational Behavior', 'Explores motivation, teams, communication, leadership, culture, decision making, and individual behavior in organizations.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('business', 'Business Administration', 'MKT 201', 'Principles of Marketing', 'Covers consumer behavior, segmentation, branding, product strategy, pricing, channels, promotion, and marketing planning.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('business', 'Business Administration', 'OPMT 301', 'Operations Management', 'Introduces process design, capacity, quality, forecasting, inventory, supply chains, and operational performance improvement.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('business', 'Finance', 'FIN 201', 'Financial Management', 'Introduces time value of money, financial statements, risk and return, budgeting, capital structure, and financial decisions.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('business', 'Finance', 'ACCT 201', 'Financial Accounting', 'Covers accounting cycles, statements, assets, liabilities, equity, revenue recognition, and financial reporting fundamentals.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('business', 'Finance', 'ECON 201', 'Microeconomics', 'Studies markets, supply and demand, elasticity, consumer choice, production, market structures, and public policy applications.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('business', 'Finance', 'FIN 320', 'Investments', 'Covers securities, portfolio risk, diversification, valuation, market efficiency, bonds, equities, and investment strategy.', 3, 'English', 'undergraduate', 2, 'spring', 1);

INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT DISTINCT
  course_template.code,
  course_template.title,
  course_template.description,
  course_template.credits,
  course_template.language,
  course_template.level,
  d.department_id
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_course_template course_template
  ON course_template.department_kind = seed.department_kind
WHERE NOT EXISTS (
  SELECT 1
  FROM course existing_course
  WHERE existing_course.department_id = d.department_id
    AND LOWER(existing_course.code) = LOWER(course_template.code)
);

INSERT INTO roadmap (
  major_id,
  level,
  title,
  total_credits,
  is_published,
  created_by
)
SELECT
  m.major_id,
  'undergraduate',
  major_template.roadmap_title,
  SUM(course_template.credits),
  1,
  NULL
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_major_template major_template
  ON major_template.department_kind = seed.department_kind
JOIN major m
  ON m.department_id = d.department_id
  AND LOWER(m.name) = LOWER(major_template.major_name)
  AND m.is_active = 1
JOIN tmp_full_catalog_course_template course_template
  ON course_template.department_kind = seed.department_kind
  AND course_template.major_name = major_template.major_name
WHERE NOT EXISTS (
  SELECT 1
  FROM roadmap existing_roadmap
  WHERE existing_roadmap.major_id = m.major_id
    AND existing_roadmap.level = 'undergraduate'
)
GROUP BY
  m.major_id,
  major_template.roadmap_title;

INSERT IGNORE INTO roadmap_course (
  roadmap_id,
  course_id,
  year_number,
  semester,
  sequence_order
)
SELECT
  r.roadmap_id,
  c.course_id,
  course_template.year_number,
  course_template.semester,
  course_template.sequence_order
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_major_template major_template
  ON major_template.department_kind = seed.department_kind
JOIN major m
  ON m.department_id = d.department_id
  AND LOWER(m.name) = LOWER(major_template.major_name)
  AND m.is_active = 1
JOIN roadmap r
  ON r.major_id = m.major_id
  AND r.level = 'undergraduate'
  AND r.created_by IS NULL
  AND r.title = major_template.roadmap_title
JOIN tmp_full_catalog_course_template course_template
  ON course_template.department_kind = seed.department_kind
  AND course_template.major_name = major_template.major_name
JOIN course c
  ON c.department_id = d.department_id
  AND LOWER(c.code) = LOWER(course_template.code)
  AND c.deleted_at IS NULL;

UPDATE course
SET description = CASE
  WHEN title LIKE 'Requirement:%'
    OR title LIKE '%Elective%'
    OR title LIKE '%Approved%'
    THEN CONCAT(
      'This curriculum requirement lets students complete the ',
      LOWER(TRIM(REPLACE(title, 'Requirement:', ''))),
      ' component of their program while choosing an approved course that fits their academic plan.'
    )
  WHEN title LIKE '%Lab%'
    OR title LIKE '%Laboratory%'
    THEN CONCAT(
      'This laboratory course gives students hands-on practice with ',
      LOWER(title),
      ', including experiments, technical tools, measurement, implementation, and applied problem solving.'
    )
  WHEN title REGEXP 'Arabic|English|Communication|Langue|Expression'
    THEN 'This course strengthens language, communication, reading, writing, and presentation skills needed for academic and professional work.'
  WHEN title REGEXP 'Calculus|Math|Linear Algebra|Differential|Statistics|Probability|Numerical|Graph'
    THEN 'This course develops mathematical methods for engineering problem solving, including theory, applied examples, analysis, and quantitative reasoning.'
  WHEN title REGEXP 'Physics|Chemistry|Science|Thermodynamics'
    THEN 'This science course covers foundational concepts, laboratory or analytical methods, and applications that support engineering study.'
  WHEN title REGEXP 'Program|Software|Data Structure|Algorithm|Database|Compiler|Operating|Computer'
    THEN CONCAT(
      'This course covers ',
      LOWER(title),
      ' through core computing concepts, programming practice, system design, and applied technical problem solving.'
    )
  WHEN title REGEXP 'Circuit|Electronics|Signal|Communication|Network|Wireless|Telecommunication|Electro'
    THEN CONCAT(
      'This course covers ',
      LOWER(title),
      ' through engineering theory, analysis methods, practical design, and real-world communication or electronic systems.'
    )
  WHEN title REGEXP 'Project|Capstone|Design|Field Training|Stage|Seminar'
    THEN 'This course applies program knowledge through project work, documentation, teamwork, implementation, evaluation, and professional presentation.'
  WHEN title REGEXP 'Ethics|Values|Humanities|Social|Culture|Sustainable'
    THEN 'This course builds broader professional and cultural awareness through ethics, society, communication, responsibility, and reflective academic work.'
  ELSE CONCAT(
    'This course introduces ',
    LOWER(title),
    ' through core concepts, applied examples, practical skills, and problem solving connected to the program.'
  )
END
WHERE description REGEXP 'Source:|PDF|pdf|official roadmap item|supplied by user|catalogue|reference|Foundation .* prerequisite|^waves$|No description';

UPDATE course
SET description = REPLACE(
  description,
  'civilization impact on the modern world',
  'civilization''s impact on the modern world'
);

DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_course_template;
DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_major_template;
DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_department_seed;
-- END CATALOG EXPANSION

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
