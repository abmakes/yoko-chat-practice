export interface ConversationLine {
  speaker: 'staff' | 'guest';
  english: string;
  vietnamese?: string;
}

export interface Conversation {
  id: string;
  title: string;
  description?: string;
  unit?: string;
  lines: ConversationLine[];
}

export const sampleConversations: Conversation[] = [
  {
    id: 'weather-1',
    title: 'Weather',
    lines: [
      {
        speaker: 'staff',
        english: 'Good morning, Ma\'am!',
        vietnamese: 'Chào buổi sáng, thưa bà!'
      },
      {
        speaker: 'guest',
        english: 'Good morning.',
        vietnamese: 'Chào buổi sáng.'
      },
      {
        speaker: 'staff',
        english: 'How are you today, Ma\'am?',
        vietnamese: 'Hôm nay bà có khỏe không ạ?'
      },
      {
        speaker: 'guest',
        english: 'I\'m good. Do you know the weather forecast for today? What is the weather like?',
        vietnamese: 'Tôi khỏe. Bạn có biết dự báo thời tiết hôm nay không? Thời tiết thế nào?'
      },
      {
        speaker: 'staff',
        english: 'It\'s going to be sunny until midday, then there will be showers in the afternoon.',
        vietnamese: 'Trời sẽ nắng đến trưa, sau đó sẽ có mưa rào vào buổi chiều.'
      },
      {
        speaker: 'guest',
        english: 'I hate the rain. Does it often rain in this season?',
        vietnamese: 'Tôi ghét mưa. Mùa này có hay mưa không?'
      },
      {
        speaker: 'staff',
        english: 'Yes, Ma\'am. It\'s now the rainy season in Phu Quoc. Do you have plans for today?',
        vietnamese: 'Vâng thưa bà. Bây giờ là mùa mưa ở Phú Quốc. Bà có kế hoạch gì cho hôm nay không?'
      },
      {
        speaker: 'guest',
        english: 'I\'m gonna spend the morning at the pool and then go sightseeing in the afternoon.',
        vietnamese: 'Tôi sẽ dành buổi sáng ở hồ bơi và sau đó đi tham quan vào buổi chiều.'
      },
      {
        speaker: 'staff',
        english: 'So I think you should bring an umbrella in case it might rain.',
        vietnamese: 'Vậy tôi nghĩ bà nên mang theo ô phòng trường hợp trời mưa.'
      },
      {
        speaker: 'guest',
        english: 'Ok, thank you.',
        vietnamese: 'Vâng, cảm ơn bạn.'
      },
      {
        speaker: 'staff',
        english: 'It\'s my pleasure. Have a nice day, Ma\'am.',
        vietnamese: 'Đó là niềm vui của tôi. Chúc bà một ngày tốt lành.'
      }
    ]
  },
  {
    id: 'check-in-1',
    title: 'Check-in',
    lines: [
      {
        speaker: 'staff',
        english: 'Good afternoon and welcome to YOKO Onsen Spa & Resort!',
        vietnamese: 'Chào buổi chiều và chào mừng đến với YOKO Onsen Spa & Resort!'
      },
      {
        speaker: 'guest',
        english: 'Thank you. I have a reservation under the name Johnson.',
        vietnamese: 'Cảm ơn. Tôi có đặt phòng dưới tên Johnson.'
      },
      {
        speaker: 'staff',
        english: 'Yes, I can see your booking here. You have reserved a Deluxe Room for 3 nights, is that correct?',
        vietnamese: 'Vâng, tôi có thể thấy đặt phòng của bạn ở đây. Bạn đã đặt phòng Deluxe trong 3 đêm, đúng không ạ?'
      },
      {
        speaker: 'guest',
        english: 'That\'s right.',
        vietnamese: 'Đúng rồi.'
      },
      {
        speaker: 'staff',
        english: 'May I see your passport, please?',
        vietnamese: 'Cho tôi xem hộ chiếu của bạn được không ạ?'
      },
      {
        speaker: 'guest',
        english: 'Sure, here you go.',
        vietnamese: 'Được, đây ạ.'
      },
      {
        speaker: 'staff',
        english: 'Thank you. Your room is on the 5th floor with a beautiful valley view. Here is your key card.',
        vietnamese: 'Cảm ơn. Phòng của bạn ở tầng 5 với view thung lũng tuyệt đẹp. Đây là thẻ phòng của bạn.'
      },
      {
        speaker: 'guest',
        english: 'What time is breakfast served?',
        vietnamese: 'Bữa sáng được phục vụ lúc mấy giờ?'
      },
      {
        speaker: 'staff',
        english: 'Breakfast is served from 6:30 AM to 10:00 AM at our main restaurant on the ground floor.',
        vietnamese: 'Bữa sáng được phục vụ từ 6:30 sáng đến 10:00 sáng tại nhà hàng chính ở tầng trệt.'
      },
      {
        speaker: 'guest',
        english: 'Perfect, thank you very much.',
        vietnamese: 'Tuyệt vời, cảm ơn rất nhiều.'
      },
      {
        speaker: 'staff',
        english: 'You\'re welcome. Enjoy your stay!',
        vietnamese: 'Không có gì. Chúc bạn có kỳ nghỉ vui vẻ!'
      }
    ]
  }
];

// Function to generate wrong answer options
export function generateWrongOptions(
  correctAnswer: string,
  allLines: ConversationLine[],
  currentSpeaker: 'staff' | 'guest'
): string[] {
  const oppositeSpeaker = currentSpeaker === 'staff' ? 'guest' : 'staff';
  
  // Get all lines from the same speaker type (to make plausible wrong answers)
  const sameSpeakerLines = allLines
    .filter(line => line.speaker === oppositeSpeaker && line.english !== correctAnswer)
    .map(line => line.english);
  
  // Shuffle and pick up to 2 wrong options
  const shuffled = sameSpeakerLines.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

// Parse pasted conversation text
export function parseConversationText(text: string, title: string): Conversation | null {
  try {
    const lines: ConversationLine[] = [];
    const textLines = text.split('\n').filter(line => line.trim());
    
    for (const line of textLines) {
      const staffMatch = line.match(/^Staff:\s*(.+)/i);
      const guestMatch = line.match(/^Guest:\s*(.+)/i);
      
      if (staffMatch) {
        lines.push({
          speaker: 'staff',
          english: staffMatch[1].trim()
        });
      } else if (guestMatch) {
        lines.push({
          speaker: 'guest',
          english: guestMatch[1].trim()
        });
      }
    }
    
    if (lines.length === 0) return null;
    
    return {
      id: `custom-${Date.now()}`,
      title,
      lines
    };
  } catch {
    return null;
  }
}
