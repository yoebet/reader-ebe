import {Component, OnInit} from '@angular/core';

import {ComponentModalConfig, SuiModal, SuiModalService} from 'ng2-semantic-ui';

import {Book} from '../models/book';
import {ChapService} from '../services/chap.service';
import {ParaService} from '../services/para.service';
import {ChapTextEditContext, ChapTextEditModal} from './chap-text-edit.component';


interface TextStat {
  length: number;
  lineCount: number;
  nonEmptyLineCount: number;
  textSummary: string;
}

interface ChapHolder {
  chapText: string;
  titleLine: string;
  chapTitle?: string;
  textStat: TextStat;
}

const ChapSplitter = '-2345-CS-YW-';
const ChapTitleSplitter = '-6789-TS-YW-';

@Component({
  selector: 'book-import',
  templateUrl: './book-import.component.html',
  styleUrls: ['./book-import.component.css']
})
export class BookImportComponent implements OnInit {
  book: Book;

  chapTitleLinePattern: string;
  chapTitlePattern: string;

  bookText: string;
  bookTextStat: TextStat;
  chapHolders: ChapHolder[];

  step: 'paste-book-text' | 'split-chaps' | 'edit-chaps' | 'save-chaps' = 'paste-book-text';


  constructor(private chapService: ChapService,
              private paraService: ParaService,
              private modalService: SuiModalService,
              private modal: SuiModal<BookImportContext, string, string>) {
    let context = modal.context;
    this.book = context.book;

    this.bookText = 'WARNING\n' +
      '\n' +
      'This eBook is of the educational purposes only. Any commercial or political intention is not allowed. Texts copyright holders are those who published the materials. OCR transcriptions and proof-readings were conducted by LAO JIANHUA and XUE XUEYAN. All rights reserved.\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'Fast Reading (I)\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '1. The New World\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'In the eighteenth century young ladies in Italy were taught reading, writing, music and arithmetic. But their knowledge of history and geography was very poor.\n' +
      '\n' +
      'Once the French ambassador in Rome was giving a ball to which many important people were invited. The Italian Minister of Foreign Affairs came very late. A young lady, who was well acquainted with him, saw him enter the ball-room and asked why he was so late.\n' +
      '\n' +
      '"You see," said the Minister, "there has been a little accident at the King\'s palace."\n' +
      '\n' +
      'The curious young lady asked the Minister to tell her what had happened at the King\'s palace.\n' +
      '\n' +
      '"Oh, nothing important," answered the Minister. "The ambassador of Brazil, who was to be presented to the King, forgot to take his credentials with him and was obliged to go back to his hotel to bring them. If he had left them in Brazil we should have had to wait at least six months for them."\n' +
      '\n' +
      '"Is Brazil so far from Rome?" asked the lady, who knew very little geography.\n' +
      '\n' +
      '"It is in the New World," said the Minister.\n' +
      '\n' +
      '"In the New World?" repeated the lady in great astonishment.\n' +
      '\n' +
      '"Yes, in the New World," answered the Minister in a sarcastic tone, "which was discovered by Christopher Columbus."\n' +
      '\n' +
      'When the young lady heard this, she rushed into the middle of the ball-room and shouted as loud as she could:\n' +
      '\n' +
      '"Ladies-and gentlemen, have you heard the latest news? A new world has just been discovered by a certain Christopher Columbus."\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '2. Population Control\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'The world\'s population continues to grow. There now are about 4 billion of us on earth. That could reach 6 billion by the end of the century and 11 billion in a further 75 years. Experts have long been concerned about such a growth. Where will we find the food, water, jobs, houses, schools and health care for all these people?\n' +
      '\n' +
      'A major new study shows that the situation may be changing. A large and rapid drop in the world\'s birth rate has taken place during the past 10 years. Families generally are smaller now than they were a few years ago. It is happening in both developing and industrial nations.\n' +
      '\n' +
      'Researchers said they found a number of reasons for this. More men and women are waiting longer to get married and are using birth control devices and methods to prevent or delay pregnancy. More women are going to school or working at jobs away from home instead of having children. And more governments, especially in developing nations, now support family planning programs to reduce population growth.\n' +
      '\n' +
      'China is one of the nations that have made great progress in reducing its population growth. China has already cut its rate of population growth by about one half since 1970.\n' +
      '\n' +
      'Each Chinese family is now urged to have no more than one child. And the hope is to reach a zero population growth with the total number of births equaling the total number of deaths by the year 2000.\n' +
      '\n' +
      'Several nations in Europe already have fewer births than deaths. Experts said that these nations could face a serious shortage of workers in the future. And the persons who are working could face much higher taxes to help support the growing number of retired people.\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '3. A Working Woman\'s Dilemma\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'Dear Doctor,\n' +
      '\n' +
      'My husband and I got married in 1965 and for the first ten years of our marriage I was very happy to stay home and raise our three children. Then four years ago, our youngest child went to school and I thought I might go back to work.\n' +
      '\n' +
      'My husband was very supportive and helped me to make my decision, he emphasized all of the things I can do around the house, and said he thought I could be a great success in business.\n' +
      '\n' +
      'After several weeks of job-hunting. I found my present job, which is working for a small public relations firm. At first, my husband was very proud of me and would tell his friends, "My clever little wife can run that company she\'s working for.\n' +
      '\n' +
      'But as his joking remark approached reality, my husband stopped talking to me about my job. I have received several promotions and pay increases, and I am now making more money than he is. I can buy my own clothes and a new car. Because of our combined incomes, my husband and I can do many things that we had always dreamed of doing, but we don\'t do these things because he is very unhappy.\n' +
      '\n' +
      'We fight about little things and my husband is very critical of me in front of our friends. For the first time in our marriage, I think there is a possibility that our marriage may come to an end.\n' +
      '\n' +
      'I love my husband very much, and I don\'t want him to feel inferior, but I also love my job. I think I can be a good wife and a working woman, but I don\'t know how. Can you give me some advice? Will I have to choose one or the other or can I keep both my husband and my new career?\n' +
      '\n' +
      'Please help.\n' +
      '\n' +
      '"DISTRESSED"\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '4. An Advertisement\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'A man once said how useless it was to put advertisements in the newspapers. "Last week," said he, "my umbrella was stolen from a London church. As it was a present, I spent twice its worth in advertising, but didn\'t get it back."\n' +
      '\n' +
      '"How did you write your advertisement?" asked one of the listeners, a merchant.\n' +
      '\n' +
      '"Here it is," said the man, taking out of his pocket a slip cut from a newspaper. The other man took it and read, "Lost from the City Church last Sunday evening, a black silk umbrella. The gentleman who finds it will receive ten shillings on leaving it at No. 10 Broad Street.\n' +
      '\n' +
      '"Now," said the merchant, "I often advertise, and find that it pays me well. But the way in which an advertisement is expressed is of extreme importance. Let us try for your umbrella again, and if it fails, I\'ll buy you a new one.\n' +
      '\n' +
      'The merchant then took a slip of paper out of his pocket and wrote: "If the man who was seen to take an umbrella from the City Church last Sunday evening doesn\'t wish to get into trouble, he will return the umbrella to No. 10 Broad Street. He is well known.\n' +
      '\n' +
      'This appeared in the paper, and on the following morning, the man was astonished when he opened the front door. In the doorway lay at least twelve umbrellas of all sizes and colours that had been thrown in, and his own was among the number. Many of them had notes fastened to them saying that they had been taken by mistake, and begging the loser not to say anything about the matter.\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '5. My First Day in the United States\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'I arrived in the United States on February 6, 1966, but I remember my first day here very clearly. My friend was waiting for me when my plane landed at Kennedy Airport at three o\'clock in the afternoon. The weather was very cold and it was snowing, but I was too excited to mind. From the airport, my friend and I took a taxi to my hotel. On the way, I saw the skyline of Manhattan for the first time and I stared in astonishment at the famous skyscrapers and their man-made beauty. My friend helped me unpack at the hotel and then left me because he had to go back to work. He promised to return the next day.\n' +
      '\n' +
      'Shortly after my friend had left, I went to a restaurant near the hotel to get something to eat. Because I couldn\'t speak a word of English. I couldn\'t tell the waiter what I wanted. I was very upset and started to make some gestures, but the waiter didn\'t understand me. Finally, I ordered the same thing the man at the next table was eating. After dinner, I started to walk along Broadway until I came to Times Square with its movie theatres, neon lights, and huge crowds of people. I did not feel tired, so I continued to walk around the city. I wanted to see everything on my first day. I knew it was impossible, but I wanted to try.\n' +
      '\n' +
      'When I returned to the hotel, I was exhausted, but I couldn\'t sleep because I kept hearing the fire and police sirens during the night. I lay awake and thought about New York. It was a very big and interesting city with many tall buildings and big cars, and full of noise and busy people. I also decided right then \'that I had to learn to speak English.\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      '6. Handling Office Calls\n' +
      '\n' +
      '\n' +
      '\n' +
      '\n' +
      'The phone is ringing at the other end of the line and it clicks as it is being answered. A voice says quickly, "Hello. Will you hold, please?" Then there is another click, followed by silence. It seems like hours before someone comes back on the line—that is, if you don\'t hang up first.\n' +
      '\n' +
      'Office calls are, perhaps, the most difficult and the most important part of a secretary\'s work. The first impression that a client receives about a business is very often through a telephone contact. A caller who is left hanging on "hold" will get the feeling that he or she has been forgotten or ignored. If a call is answered rudely, the caller may become angry. And if the call is not routed directly to the right person, the caller may feel that he or she is getting the "runaround.\n' +
      '\n' +
      'Laura Needham is a secretary in the executive offices of a large manufacturing company. As a good office secretary, Laura knows that all phone calls must be answered promptly and handled efficiently. She knows that a secretary must be pleasant and helpful, no matter how busy she is or what kind of mood she may be in. She knows she must keep calm if a caller gets impatient or becomes angry; also, of course, she knows she can never allow herself to lose her temper. If she does not have the information the caller asks for, she must know who does have the information. Finally, she knows that one of her most important responsibilities is to "screen" telephone calls and to know which calls to refer to her boss, which calls to refer to other people, and which calls to handle herself.\n' +
      '\n' +
      'A well-handled telephone call will give the caller a good impression of the company he or she is dealing with. For this reason, an office secretary who can handle telephone calls cheerfully, tactfully, and efficiently is a valuable asset to any organization.\n';
    this.chapTitleLinePattern = '\\d+\\. .+\\r?\\n';
  }

  ngOnInit(): void {
  }

  editChapTitle(chapHolder) {

  }

  edit(chap) {

  }

  splitChaps() {

    console.log('>>>>');

    let regex = new RegExp(this.chapTitleLinePattern, 'g');

    let text = this.bookText.replace(regex, ((tl, args) => `${ChapSplitter}${tl}${ChapTitleSplitter}`));

    let titleAndTexts = text.split(ChapSplitter);

    let chapHolders: ChapHolder[] = [];
    for (let titleAndText of titleAndTexts) {
      titleAndText = titleAndText.trim();
      if (!titleAndText) {
        continue;
      }
      let titleLine = '', chapText;
      if (titleAndText.indexOf(ChapTitleSplitter) === -1) {
        chapText = titleAndText;
      } else {
        [titleLine, chapText] = titleAndText.split(ChapTitleSplitter);
        titleLine = titleLine.trim();
        chapText = chapText.trim();
      }
      let textStat = this.statisticText(chapText);
      chapHolders.push({titleLine, chapText, textStat});
    }

    this.chapHolders = chapHolders;
  }

  statisticText(text: string): TextStat {
    let stat: TextStat = {length: text.length, lineCount: 0, nonEmptyLineCount: 0, textSummary: ''};
    if (!text) {
      return stat;
    }
    let lines = text.split(/\r\n|\r|\n/);
    stat.lineCount = lines.length;
    lines = lines.filter(l => l);
    stat.nonEmptyLineCount = lines.length;
    let firstLine = lines[0];
    let textSummary;
    if (lines.length > 1) {
      let lastLine = lines[lines.length - 1];
      textSummary = `${firstLine}\n......\n${lastLine}`;
    } else {
      textSummary = firstLine;
    }
    stat.textSummary = textSummary;
    return stat;
  }

  goBackStepPasteBookText() {
    this.step = 'paste-book-text';
  }

  goToStepSplitChaps() {
    this.step = 'split-chaps';
    this.bookTextStat = this.statisticText(this.bookText);
  }

  goBackStepSplitChaps() {
    this.step = 'split-chaps';
  }

  goToStepEditChaps() {
    this.step = 'edit-chaps';
  }


  save() {
    this.modal.approve('');
  }

  showChapText(chapHolder: ChapHolder) {
    let context = new ChapTextEditContext();
    context.chapText = chapHolder.chapText;
    context.chapTitle = chapHolder.chapTitle || chapHolder.titleLine;

    this.modalService.open(new ChapTextEditModal(context))
      .onApprove((text: string) => {
        if (text) {
          chapHolder.chapText = text;
          chapHolder.textStat = this.statisticText(text);
        }
      });
  }

  close() {
    //
    if (!this.bookText || confirm('要取消操作吗？')) {
      this.modal.approve('');
    }
  }
}

export class BookImportContext {
  book: Book;
}

export class BookImportModal extends ComponentModalConfig<BookImportContext> {
  constructor(context: BookImportContext) {
    super(BookImportComponent, context, false);
    // this.size = ModalSize.Large;
    this.isFullScreen = true;
    this.mustScroll = true;
  }
}
