/**
 * AI Agent Service
 *
 * Provides an AI-powered assistant that helps visitors build customized menus
 * for their events based on budget, dietary needs, guest count, and preferences.
 *
 * Uses Groq (LLaMA) to:
 *  1. Chat with visitors about their event requirements
 *  2. Query existing dishes/menus from the database
 *  3. Generate a tailored menu proposal in the company's format
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import OpenAI from 'openai';
import { ChatMessageDto } from './dto/ai-agent.dto';
import { Prisma, Allergen, Diet, Theme } from '@prisma/client';

type DishWithRelations = Prisma.DishGetPayload<{
  include: {
    DishAllergen: { include: { Allergen: true } };
    DishIngredient: { include: { Ingredient: true } };
  };
}>;

type MenuWithRelations = Prisma.MenuGetPayload<{
  include: {
    Diet: true;
    Theme: true;
    Dish: true;
    MenuIngredient: { include: { Ingredient: true } };
  };
}>;

interface ConversationEntry {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationState {
  messages: ConversationEntry[];
  context: {
    guestCount?: number;
    budgetPerPerson?: number;
    dietId?: number;
    themeId?: number;
    excludeAllergens?: number[];
    agreedDishes?: number[];
    agreedMenuId?: number;
  };
  createdAt: Date;
}

@Injectable()
export class AiAgentService implements OnModuleInit {
  private readonly logger = new Logger(AiAgentService.name);
  private openai: OpenAI | null = null;
  private readonly conversations = new Map<string, ConversationState>();

  // Cleanup stale conversations every 30 min
  private cleanupInterval!: ReturnType<typeof setInterval>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      this.logger.log('Groq client initialized — AI agent ready (LLaMA)');
    } else {
      this.logger.warn('GROQ_API_KEY not set — AI agent will run in demo mode');
    }

    // Cleanup stale conversations (older than 2h)
    this.cleanupInterval = setInterval(() => {
      const cutoff = Date.now() - 2 * 60 * 60 * 1000;
      for (const [id, conv] of this.conversations) {
        if (conv.createdAt.getTime() < cutoff) this.conversations.delete(id);
      }
    }, 30 * 60 * 1000);
  }

  /* ═══════════════════════════════════════════════════════════
     Database context gathering
     ═══════════════════════════════════════════════════════════ */

  private async gatherDatabaseContext(dto: ChatMessageDto): Promise<string> {
    const [dishes, menus, diets, themes, allergens] = await Promise.all([
      this.prisma.dish.findMany({
        include: {
          DishAllergen: { include: { Allergen: true } },
          DishIngredient: { include: { Ingredient: true } },
        },
      }),
      this.prisma.menu.findMany({
        where: { status: 'published' },
        include: {
          Diet: true,
          Theme: true,
          Dish: true,
          MenuIngredient: { include: { Ingredient: true } },
        },
      }),
      this.prisma.diet.findMany(),
      this.prisma.theme.findMany(),
      this.prisma.allergen.findMany(),
    ]);

    const dishList = dishes.map((d: DishWithRelations) => {
      const allergenNames = d.DishAllergen.map((da: { Allergen: { name: string } }) => da.Allergen.name).join(', ');
      const ingredients = d.DishIngredient.map((di: { Ingredient: { name: string; unit: string | null }; quantity: unknown }) => `${di.Ingredient.name} (${di.quantity}${di.Ingredient.unit})`).join(', ');
      return `  - [ID:${d.id}] "${d.title}" (${d.course_type ?? 'plat'}) — ${d.description || 'Pas de description'}. Allergènes: ${allergenNames || 'aucun'}. Ingrédients: ${ingredients || 'non renseignés'}`;
    }).join('\n');

    const menuList = menus.map((m: MenuWithRelations) => {
      const dishNames = m.Dish.map((d: { title: string }) => d.title).join(', ');
      return `  - [ID:${m.id}] "${m.title}" — ${m.price_per_person}€/pers, min ${m.person_min} pers. Régime: ${m.Diet?.name || 'aucun'}. Thème: ${m.Theme?.name || 'aucun'}. Plats: ${dishNames || 'aucun'}${m.is_seasonal ? ' (saisonnier)' : ''}`;
    }).join('\n');

    const dietList = diets.map((d: Diet) => `  - [ID:${d.id}] ${d.name}: ${d.description}`).join('\n');
    const themeList = themes.map((t: Theme) => `  - [ID:${t.id}] ${t.name}: ${t.description}`).join('\n');
    const allergenList = allergens.map((a: Allergen) => `  - [ID:${a.id}] ${a.name}`).join('\n');

    return `
═══ BASE DE DONNÉES VITE & GOURMAND ═══

PLATS DISPONIBLES (${dishes.length}):
${dishList}

MENUS PUBLIÉS (${menus.length}):
${menuList}

RÉGIMES ALIMENTAIRES:
${dietList}

THÈMES:
${themeList}

ALLERGÈNES RÉPERTORIÉS:
${allergenList}
`;
  }

  /* ═══════════════════════════════════════════════════════════
     System prompt
     ═══════════════════════════════════════════════════════════ */

  private buildSystemPrompt(dbContext: string): string {
    return `Tu es l'assistant IA de "Vite & Gourmand", un service de traiteur haut de gamme.
Ton rôle est d'aider les visiteurs (clients potentiels) à composer un menu personnalisé pour leur événement.
Tu es intégré dans la page de commande, à côté d'un formulaire de brief que le visiteur remplit en parallèle.

CHAMPS OBLIGATOIRES À COLLECTER :
Avant de pouvoir proposer un menu, tu DOIS obtenir ces informations essentielles :
- 🎉 Type d'événement (mariage, anniversaire, séminaire, baptême, etc.)
- 👥 Nombre de convives
- 💰 Budget par personne
- 📅 Date souhaitée de l'événement
Si le visiteur ne les a pas encore fournis, pose la question de manière naturelle et chaleureuse.
Ne propose JAMAIS un menu complet tant que ces 4 champs ne sont pas renseignés.

INFORMATIONS RECOMMANDÉES (à demander si pertinent) :
- 🥗 Régimes alimentaires (végétarien, halal, sans gluten…)
- ⚠️ Allergies à prendre en compte
- 🎨 Thème ou ambiance souhaitée

RÈGLES :
1. Tu parles TOUJOURS en français, de manière professionnelle mais chaleureuse et accueillante.
2. Tu t'appuies UNIQUEMENT sur les plats et menus réels de la base de données ci-dessous.
3. Tu poses des questions pour comprendre les besoins : nombre de convives, budget, régime alimentaire, allergies, thème de l'événement, préférences.
4. Tu proposes des menus adaptés au budget (prix/personne × nombre de convives).
5. Tu respectes STRICTEMENT les contraintes d'allergènes et de régime.
6. Tu suggères des services complémentaires pour enrichir l'expérience : décoration, animation, boissons, service en salle, location de matériel.
7. Quand un menu est validé, tu le présentes dans un format structuré clair.

FORMAT MENU PERSONNALISÉ :
═══════════════════════════
🍽️ MENU « [Nom du menu] »
Pour [X] convives — [budget]€/personne
Thème : [thème] | Régime : [régime]
───────────────────────────
🥗 ENTRÉE : [Nom du plat]
🍖 PLAT : [Nom du plat]
🍰 DESSERT : [Nom du plat]
───────────────────────────
💰 Total estimé : [X]€ ([Y]€/pers × [Z] convives)
📝 Notes : [remarques spéciales]
═══════════════════════════

8. Si le client veut un menu existant adapté, propose des modifications plutôt que de créer from scratch.
9. Donne des estimations de coût réalistes basées sur les prix dans la base.
10. Si tu ne peux pas satisfaire une demande avec les plats existants, dis-le clairement et propose une alternative.
11. Propose toujours des services additionnels (boissons, desserts supplémentaires, décoration) pour enrichir l'expérience.
12. Quand la proposition est validée, invite le visiteur à vérifier le brief à droite puis à cliquer "Envoyer la demande" pour que l'équipe reçoive un ticket avec tous les détails.
13. Tes réponses doivent être concises mais chaleureuses. Ne répète jamais le format du menu dans la conversation, utilise-le uniquement pour les propositions finales.
14. Les informations remplies par le visiteur apparaissent automatiquement dans le brief à droite — tu peux y faire référence en disant "je vois que vous avez indiqué…".

${dbContext}`;
  }

  /* ═══════════════════════════════════════════════════════════
     Chat
     ═══════════════════════════════════════════════════════════ */

  async chat(userId: number, dto: ChatMessageDto) {
    const convId = dto.conversationId || this.generateConversationId();

    // Get or create conversation
    let conversation = this.conversations.get(convId);
    if (!conversation) {
      const dbContext = await this.gatherDatabaseContext(dto);
      conversation = {
        messages: [{ role: 'system', content: this.buildSystemPrompt(dbContext) }],
        context: {
          guestCount: dto.guestCount,
          budgetPerPerson: dto.budgetPerPerson,
          dietId: dto.dietId,
          themeId: dto.themeId,
          excludeAllergens: dto.excludeAllergens,
        },
        createdAt: new Date(),
      };
      this.conversations.set(convId, conversation);

      // Add initial context message if constraints were provided
      const constraints: string[] = [];
      if (dto.guestCount) constraints.push(`${dto.guestCount} convives`);
      if (dto.budgetPerPerson) constraints.push(`budget ${dto.budgetPerPerson}€/personne`);
      if (dto.dietId) constraints.push(`régime alimentaire ID:${dto.dietId}`);
      if (dto.themeId) constraints.push(`thème ID:${dto.themeId}`);
      if (dto.excludeAllergens?.length) constraints.push(`allergènes à exclure IDs: ${dto.excludeAllergens.join(', ')}`);

      if (constraints.length > 0) {
        conversation.messages.push({
          role: 'system',
          content: `Contexte client transmis par l'équipe : ${constraints.join(' | ')}. Utilise ces informations dans tes propositions.`,
        });
      }
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: dto.message });

    // Get AI response
    const assistantMessage = await this.getAiResponse(conversation.messages);
    conversation.messages.push({ role: 'assistant', content: assistantMessage });

    return {
      conversationId: convId,
      message: assistantMessage,
      context: conversation.context,
      messageCount: conversation.messages.filter(m => m.role !== 'system').length,
    };
  }

  /* ═══════════════════════════════════════════════════════════
     AI Response (OpenAI or Demo fallback)
     ═══════════════════════════════════════════════════════════ */

  private async getAiResponse(messages: ConversationEntry[]): Promise<string> {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 2048,
        });
        return response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
      } catch (err) {
        this.logger.error('Groq API error', err);
        return 'Erreur de communication avec l\'IA. Veuillez réessayer dans quelques instants.';
      }
    }

    // Demo mode — no API key
    return this.getDemoResponse(messages);
  }

  private getDemoResponse(messages: ConversationEntry[]): string {
    const userMessages = messages.filter(m => m.role === 'user');
    const lastMsg = userMessages.at(-1)?.content.toLowerCase() || '';

    if (userMessages.length === 1) {
      return `Bonjour ! 👋 Je suis l'assistant IA de Vite & Gourmand.

Je suis là pour vous aider à composer le menu idéal pour votre événement !

Pour commencer, dites-moi :
1. 🎉 Quel **type d'événement** organisez-vous ?
2. 👥 **Combien de convives** seront présents ?
3. 💰 Avez-vous un **budget par personne** en tête ?
4. 🥗 Des **régimes alimentaires** à respecter ? (végétarien, sans gluten…)
5. ⚠️ Des **allergies** à prendre en compte ?

N'hésitez pas, je suis là pour vous guider ! 😊

> ℹ️ **Mode démo** — Les réponses sont pré-configurées. En production, l'IA génère de vraies propositions de menus basées sur notre carte.`;
    }

    if (lastMsg.includes('convive') || lastMsg.includes('personne') || /\d+\s*(pers|invit|conviv)/.test(lastMsg)) {
      return `Parfait, j'ai bien noté ! 👥

Maintenant, quel **budget par personne** envisagez-vous ?
Par exemple : 25€, 35€, 50€/personne…

Cela me permettra de vous proposer un menu adapté parmi nos créations. 🍽️

> ℹ️ Mode démo — réponses pré-définies.`;
    }

    if (lastMsg.includes('budget') || lastMsg.includes('€') || lastMsg.includes('euro')) {
      return `Excellent, budget noté ! 💰

Y a-t-il des **contraintes alimentaires** à prendre en compte ?
- Végétarien, végan, sans gluten, halal…
- Des **allergies** particulières ?

Notre chef s'adapte à toutes les exigences pour que chacun de vos convives passe un moment inoubliable. ✨

> ℹ️ Mode démo — En production, je vous proposerai un menu complet.`;
    }

    return `Merci pour ces précisions ! 📝

En mode démo, je ne peux malheureusement pas générer de proposition complète.
Mais voici ce que l'assistant complet peut faire pour vous :

✅ Proposer des menus sur mesure adaptés à votre budget
✅ Respecter toutes les contraintes alimentaires et allergies
✅ Calculer le coût total de votre événement
✅ Suggérer des services complémentaires (boissons, décoration…)

En attendant, n'hésitez pas à remplir le **formulaire de contact** à gauche avec vos besoins — notre équipe vous répondra avec une proposition personnalisée sous 24h ! 📧

> ℹ️ Mode démo actif.`;
  }

  /* ═══════════════════════════════════════════════════════════
     Conversation management
     ═══════════════════════════════════════════════════════════ */

  getConversation(conversationId: string) {
    const conv = this.conversations.get(conversationId);
    if (!conv) return null;
    return {
      conversationId,
      messages: conv.messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content })),
      context: conv.context,
      createdAt: conv.createdAt,
    };
  }

  listConversations() {
    const result: { id: string; messageCount: number; createdAt: Date }[] = [];
    for (const [id, conv] of this.conversations) {
      result.push({
        id,
        messageCount: conv.messages.filter(m => m.role !== 'system').length,
        createdAt: conv.createdAt,
      });
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  deleteConversation(conversationId: string) {
    return this.conversations.delete(conversationId);
  }

  getStatus() {
    return {
      aiEnabled: !!this.openai,
      model: this.openai ? 'llama-3.3-70b-versatile' : 'demo',
      activeConversations: this.conversations.size,
    };
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
