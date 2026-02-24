package com.gohabit.dto;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private int coins;
    private int xp;
    private int level;
}
```

---


**`Habit.java`**
```
id, name, description, frequency (DAILY/WEEKLY), userId, createdAt
```

**`HabitLog.java`**
```
id, habitId, completedAt, streakDay
```

**`Task.java`**
```
id, title, description, dueDate, status (PENDING/DONE), userId
```

**`Avatar.java`**
```
id, userId, stage (SEED/SPROUT/TREE...), totalDays
```

**`Accessory.java`**
```
id, name, rarity (COMMON/RARE/EPIC), imageUrl
```

**`UserAccessory.java`**
```
id, userId, accessoryId, equippedAt
```

**`Friendship.java`**
```
id, userId, friendId, status (PENDING/ACCEPTED)