document.addEventListener('DOMContentLoaded', () => {
    const TOTAL_LETTERS = 50;
    const chars = [
      'ሀ','ሁ','ሂ','ሃ','ሄ','ህ','ሆ',
      'ለ','ሉ','ሊ','ላ','ሌ','ል','ሎ',
      'መ','ሙ','ሚ','ማ','ሜ','ም','ሞ',
      'ሠ','ሡ','ሢ','ሣ','ሤ','ሥ','ሦ',
      'ረ','ሩ','ሪ','ራ','ሬ','ር','ሮ',
      'ሰ','ሱ','ሲ','ሳ','ሴ','ስ','ሶ',
      'ሸ','ሹ','ሺ','ሻ','ሼ','ሽ','ሾ',
      'ቀ','ቁ','ቂ','ቃ','ቄ','ቅ','ቆ',
      'በ','ቡ','ቢ','ባ','ቤ','ብ','ቦ',
      'ተ','ቱ','ቲ','ታ','ቴ','ት','ቶ',
      'ቸ','ቹ','ቺ','ቻ','ቼ','ች','ቾ',
      'ኀ','ኁ','ኂ','ኃ','ኄ','ኅ','ኆ',
      'ነ','ኑ','ኒ','ና','ኔ','ን','ኖ',
      'ኘ','ኙ','ኚ','ኛ','ኜ','ኝ','ኞ',
      'አ','ኡ','ኢ','ኣ','ኤ','እ','ኦ',
      'ከ','ኩ','ኪ','ካ','ኬ','ክ','ኮ',
      'ኸ','ኹ','ኺ','ኻ','ኼ','ኽ','ኾ',
      'ወ','ዉ','ዊ','ዋ','ዌ','ው','ዎ',
      'ዐ','ዑ','ዒ','ዓ','ዔ','ዕ','ዖ',
      'ዘ','ዙ','ዚ','ዛ','ዜ','ዝ','ዞ',
      'ዠ','ዡ','ዢ','ዣ','ዤ','ዥ','ዦ',
      'የ','ዩ','ዪ','ያ','ዬ','ይ','ዮ',
      'ደ','ዱ','ዲ','ዳ','ዴ','ድ','ዶ',
      'ጀ','ጁ','ጂ','ጃ','ጄ','ጅ','ጆ',
      'ገ','ጉ','ጊ','ጋ','ጌ','ግ','ጎ',
      'ጘ','ጙ','ጚ','ጛ','ጜ','ጝ','ጞ',
      'ጠ','ጡ','ጢ','ጣ','ጤ','ጥ','ጦ',
      'ጨ','ጩ','ጪ','ጫ','ጬ','ጭ','ጮ',
      'ጰ','ጱ','ጲ','ጳ','ጴ','ጵ','ጶ',
      'ጸ','ጹ','ጺ','ጻ','ጼ','ጽ','ጾ',
      'ፀ','ፁ','ፂ','ፃ','ፄ','ፅ','ፆ',
      'ፈ','ፉ','ፊ','ፋ','ፌ','ፍ','ፎ',
      'ፐ','ፑ','ፒ','ፓ','ፔ','ፕ','ፖ'
    ];
  
    for (let i = 0; i < TOTAL_LETTERS; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const div  = document.createElement('div');
      div.className   = 'letter';
      div.textContent = char;
      div.style.left = `${Math.random() * window.innerWidth}px`;
      div.style.top  = `${Math.random() * window.innerHeight}px`;
      div.style.animationDuration = (3 + Math.random() * 3).toFixed(2) + 's';
      div.style.animationDelay    = (Math.random() * 2).toFixed(2) + 's';
      div.addEventListener('animationiteration', () => {
        div.style.left = `${Math.random() * window.innerWidth}px`;
        div.style.top  = `${Math.random() * window.innerHeight}px`;
      });
  
      document.body.appendChild(div);
    }
  });
  

  