import { Test, TestingModule } from '@nestjs/testing';
import { DesignGateway } from './design.gateway';

describe('DesignGateway', () => {
  let gateway: DesignGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DesignGateway],
    }).compile();

    gateway = module.get<DesignGateway>(DesignGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
