# Vite & Gourmand - A Modern Education Restaurant Webpage (DRAFT)

*This project was created as part of the Studi curriculum by dylan lesieur*

> A from scratch web page designed to be hackable, observable and pleasant to use.

---
## Quick Start

### Option 1: Local Development (Docker)
```bash
# Clone the repository
git clone <repository-url>
cd vite-gourmand

# Full automatic setup (Docker + PostgreSQL + MongoDB + seed data)
make quick-start-local
```

### Option 2: Supabase (Production/Staging)
```bash
# Clone the repository
git clone <repository-url>
cd vite-gourmand

# Interactive setup with Supabase
make quick-start-supabase
```

### Available Make Commands
```bash
make help                  # Show all available commands
make setup-supabase        # Configure Supabase connection
make setup-local           # Configure local Docker database
make supabase-migrate      # Deploy migrations to Supabase
make supabase-seed         # Seed Supabase database
```

---
## What Is This Project ?
Vite & Gourmand is a company constituted of two people Julie and José. To overcome the stream flow of client and new opportuntities both of them had the idea to create a webpage that make their webpage more visible.
They chose to hire a tenary company that would provide the service of building this webpage for them.

`FastDev` is the name of the company and chosen to lead teh project as soon as possible. 
Delivering a quick and efficient prototype but also appealing enouh and accessile are rules that make this task harder..

From this `30/01/2026`. I've got around two weeks to come with a solution and make it both operational, and practical.

The main purpose of this webpage is to show the menus and give the possibility to the user to order their dishes..

[clik here to access the requirements](docs/requirements.md)

## Architecture of this webpage

### Database
The firs things we're very sure about is how the datas has to be treated as the school gave us how to implement them throught a diagram UML.



## Why This Project ?
This project is my ECF alias continual formation assesment from my other school studi that I applied to pass the title of webd eveloper full stack.

The project gives a certain amount of freedoms and requirements that I need follow along the way I'm doing the webpage.

## Current State of the project



## References & Documentations
- [RGAA](https://accessibilite.numerique.gouv.fr/)
- [Glossay](docs/glossary.md)
- [Uml](https://www.geeksforgeeks.org/system-design/unified-modeling-language-uml-introduction/)
- [Github project](https://github.com/users/LESdylan/projects/3)
- [convert md to pdf with dillinger.io](https://dillinger.io/) || [convert md to pdf with markdowntopdf](https://markdowntopdf.com/)
- [Git workflow](https://danielkummer.github.io/git-flow-cheatsheet/index.es_ES.html)
- [docker Docs](https://docs.docker.com/compose/gettingstarted)
- [opinion about using TS on both side back and front](https://www.reddit.com/r/typescript/comments/uqzkuh/how_popular_is_typescript_in_backend_development/)
- [Zod 4](https://ts-rest.com/)
- [Powershell docs](https://learn.microsoft.com/en-us/powershell/)
- [lear how to use prisma with nestjs](https://docs.nestjs.com/recipes/prisma)
- [manage OAuth app breanding ](https://support.google.com/cloud/answer/15549049?hl=fr&visit_id=639056608802274595-2425559031&rd=1#publishing-status)
## Use Of AI
**Documentation & Research** - Used to clarify ambiguities in edge cases where conventions differ and to research complex topics not detailed in standard textbooks, ensuring realistic solutinos within the project's scope.

**Concept explanation** - Served as a study aid to solidify the understanding of abstract functionalities and architectural requirements necessary for building a 
webpage

**Code Generation** - Not used for logic implementation; limited to clarifcation stufy


## ❤️ Why I Loved Working On It
- It's a genuine, real-world project I could reason about
- it rewards careful thought about APIs, ownership, and semantics
- It's fun to see it get closer and closer to real project that we could use daily
