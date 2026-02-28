/**
 * ═══════════════════════════════════════════════════════════════
 * friend.service.ts — Servicio de amistades y comparación
 * ═══════════════════════════════════════════════════════════════
 *
 * Gestiona el ciclo de vida de las amistades:
 *   1. Enviar solicitud (PENDING)
 *   2. Aceptar/rechazar (ACCEPTED/REJECTED)
 *   3. Eliminar amistad
 *   4. Comparar progreso entre amigos
 *
 * Las amistades son BIDIRECCIONALES: si A envía a B y B acepta,
 * ambos se ven en la lista del otro. Por eso usamos OR en las queries.
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";

export const friendService = {
    /**
     * getFriends — Lista todos los amigos aceptados de un usuario.
     * Busca friendships donde el usuario es sender O receiver (bidireccional).
     * Devuelve los datos del OTRO usuario en cada amistad.
     */
    async getFriends(userId: string) {
        const friendships = await prisma.friendship.findMany({
            where: {
                status: "ACCEPTED",                                // Solo amistades aceptadas
                OR: [{ senderId: userId }, { receiverId: userId }], // Donde YO soy sender O receiver
            },
            include: {
                // Incluir datos básicos de AMBOS usuarios
                sender: { select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true, level: true, points: true } },
                receiver: { select: { id: true, username: true, firstName: true, lastName: true, avatarUrl: true, level: true, points: true } },
            },
        });

        // Para cada amistad, devolver el OTRO usuario (no yo mismo)
        // Si yo soy el sender, devuelvo el receiver y viceversa
        return friendships.map((f) =>
            f.senderId === userId ? f.receiver : f.sender
        );
    },

    /**
     * sendRequest — Envía una solicitud de amistad.
     *
     * Validaciones:
     *   - No puedes enviarte solicitud a ti mismo
     *   - No puede haber una solicitud previa en cualquier dirección (A→B ni B→A)
     *
     * @throws ValidationError si es a ti mismo
     * @throws ConflictError si ya existe una solicitud/amistad
     */
    async sendRequest(senderId: string, receiverId: string) {
        if (senderId === receiverId) {
            throw new ValidationError("Cannot send friend request to yourself");
        }

        // Verificar que el usuario exista
        const user = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!user) throw new NotFoundError("User");

        // Verificar que no exista solicitud previa en NINGUNA dirección
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },                       // A → B
                    { senderId: receiverId, receiverId: senderId }, // B → A
                ],
            },
        });
        if (existing) throw new ConflictError("Friendship request already exists");


        // Crear solicitud con status PENDING
        return prisma.friendship.create({
            data: { senderId, receiverId },
        });
    },

    /**
     * respondToRequest — Responde a una solicitud recibida (aceptar/rechazar).
     * Solo el RECEPTOR puede responder (verificamos receiverId === userId).
     * Solo se pueden responder solicitudes PENDING.
     */
    async respondToRequest(friendshipId: string, userId: string, status: "ACCEPTED" | "REJECTED") {
        const friendship = await prisma.friendship.findFirst({
            where: { id: friendshipId, receiverId: userId, status: "PENDING" },
        });
        if (!friendship) throw new NotFoundError("Friend request");

        return prisma.friendship.update({
            where: { id: friendshipId },
            data: { status },
        });
    },

    /**
     * removeFriend — Elimina una amistad.
     * Cualquiera de los dos (sender o receiver) puede eliminarla.
     */
    async removeFriend(friendshipId: string, userId: string) {
        const friendship = await prisma.friendship.findFirst({
            where: {
                id: friendshipId,
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
        });
        if (!friendship) throw new NotFoundError("Friendship");

        return prisma.friendship.delete({ where: { id: friendshipId } });
    },

    /**
     * compareProgress — Compara el progreso entre el usuario y un amigo.
     * Devuelve los datos de ambos para que el frontend muestre la comparación.
     */
    async compareProgress(userId: string, friendId: string) {
        // Promise.all ejecuta ambas consultas en paralelo
        const [userProgress, friendProgress] = await Promise.all([
            getProgress(userId),
            getProgress(friendId),
        ]);
        return { user: userProgress, friend: friendProgress };
    },
};

/**
 * getProgress — Helper interno para obtener el progreso resumido de un usuario.
 * Se usa dentro de compareProgress para obtener datos de ambos usuarios.
 */
async function getProgress(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true, points: true, coins: true, level: true },
    });
    if (!user) throw new NotFoundError("User");

    const [habitsCompleted, tasksCompleted] = await Promise.all([
        prisma.habitCompletion.count({ where: { userId } }),
        prisma.task.count({ where: { userId, status: "COMPLETED" } }),
    ]);

    return { ...user, habitsCompleted, tasksCompleted };
}
