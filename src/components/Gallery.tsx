import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Chip,
  Description,
  Dropdown,
  InputGroup,
  Kbd,
  Label,
  Link,
  ListBox,
  Meter,
  Modal,
  NumberField,
  Pagination,
  Popover,
  ProgressBar,
  Radio,
  RadioGroup,
  SearchField,
  Select,
  Separator,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Tabs,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@heroui/react';
import {buttonVariants} from '@heroui/styles';
import {Bell, CircleHelp, Search} from 'lucide-react';

const BUTTON_VARIANTS = ['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'danger', 'danger-soft'] as const;
const COLORS = ['default', 'accent', 'success', 'warning', 'danger'] as const;
const CHIP_VARIANTS = ['primary', 'secondary', 'soft', 'tertiary'] as const;

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className='flex flex-col gap-3'>
      <h2 className='text-xs font-semibold uppercase tracking-wider text-muted'>{title}</h2>
      {children}
    </section>
  );
}

/** Every component and variant side by side, for checking a theme element by element. */
export function Gallery() {
  return (
    <div className='flex flex-col gap-8 p-6'>
      <Section title='Buttons'>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <div
            key={size}
            className='flex flex-wrap items-center gap-2'
          >
            {BUTTON_VARIANTS.map(variant => (
              <Button
                key={variant}
                variant={variant}
                size={size}
              >
                {variant}
              </Button>
            ))}
          </div>
        ))}
        <div className='flex flex-wrap items-center gap-2'>
          <Button isDisabled>disabled</Button>
          <Button
            isIconOnly
            variant='secondary'
            aria-label='Notifications'
          >
            <Bell className='size-4' />
          </Button>
          <ButtonGroup variant='tertiary'>
            <Button>Left</Button>
            <Button>Middle</Button>
            <Button>Right</Button>
          </ButtonGroup>
          <ToggleButtonGroup
            selectionMode='single'
            defaultSelectedKeys={['day']}
            aria-label='Range'
          >
            <ToggleButton id='day'>Day</ToggleButton>
            <ToggleButton id='week'>Week</ToggleButton>
            <ToggleButton id='month'>Month</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </Section>

      <Section title='Chips'>
        {CHIP_VARIANTS.map(variant => (
          <div
            key={variant}
            className='flex flex-wrap gap-2'
          >
            {COLORS.map(color => (
              <Chip
                key={color}
                color={color}
                variant={variant}
              >
                {color}
              </Chip>
            ))}
          </div>
        ))}
      </Section>

      <Section title='Alerts'>
        <div className='grid gap-2 sm:grid-cols-2'>
          {COLORS.map(status => (
            <Alert
              key={status}
              status={status}
            >
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title className='capitalize'>{status}</Alert.Title>
                <Alert.Description>This is a {status} alert.</Alert.Description>
              </Alert.Content>
            </Alert>
          ))}
        </div>
      </Section>

      <div className='grid gap-8 md:grid-cols-2'>
        <Section title='Form fields'>
          <Card>
            <Card.Content className='flex flex-col gap-4'>
              <TextField>
                <Label>Text field</Label>
                <InputGroup>
                  <InputGroup.Input placeholder='Placeholder' />
                </InputGroup>
                <Description>Helper text</Description>
              </TextField>
              <TextField>
                <Label>With prefix</Label>
                <InputGroup>
                  <InputGroup.Prefix>
                    <Search className='size-4 text-muted' />
                  </InputGroup.Prefix>
                  <InputGroup.Input placeholder='Search…' />
                </InputGroup>
              </TextField>
              <TextField>
                <Label>Text area</Label>
                <TextArea placeholder='Write something…' />
              </TextField>
              <SearchField aria-label='Search field'>
                <Label>Search field</Label>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder='Search' />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
              <NumberField defaultValue={8}>
                <Label>Number field</Label>
                <NumberField.Group>
                  <NumberField.DecrementButton />
                  <NumberField.Input />
                  <NumberField.IncrementButton />
                </NumberField.Group>
              </NumberField>
              <Select defaultSelectedKey='two'>
                <Label>Select</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {['One', 'Two', 'Three'].map(o => (
                      <ListBox.Item
                        key={o}
                        id={o.toLowerCase()}
                        textValue={o}
                      >
                        {o}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </Card.Content>
          </Card>
        </Section>

        <Section title='Selection & range'>
          <Card>
            <Card.Content className='flex flex-col gap-4'>
              <Switch defaultSelected>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Label>Switch on</Label>
                </Switch.Content>
              </Switch>
              <Switch>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Label>Switch off</Label>
                </Switch.Content>
              </Switch>
              {[true, false].map(checked => (
                <Checkbox
                  key={String(checked)}
                  defaultSelected={checked}
                >
                  <Checkbox.Content>
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Label>Checkbox {checked ? 'checked' : 'unchecked'}</Label>
                  </Checkbox.Content>
                </Checkbox>
              ))}
              <RadioGroup
                defaultValue='a'
                name='gallery-radio'
              >
                <Label>Radio group</Label>
                {['a', 'b'].map(v => (
                  <Radio
                    key={v}
                    value={v}
                  >
                    <Radio.Content>
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <Label>Option {v.toUpperCase()}</Label>
                    </Radio.Content>
                  </Radio>
                ))}
              </RadioGroup>
              <Separator />
              <Slider defaultValue={40}>
                <Label>Slider</Label>
                <Slider.Output />
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
              {COLORS.map(color => (
                <ProgressBar
                  key={color}
                  value={65}
                  color={color}
                  aria-label={`${color} progress`}
                >
                  <ProgressBar.Track>
                    <ProgressBar.Fill />
                  </ProgressBar.Track>
                </ProgressBar>
              ))}
              <Meter
                value={80}
                color='warning'
              >
                <Label>Meter</Label>
                <Meter.Output />
                <Meter.Track>
                  <Meter.Fill />
                </Meter.Track>
              </Meter>
            </Card.Content>
          </Card>
        </Section>
      </div>

      <Section title='Surfaces'>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {(
            [
              ['bg-background', 'background'],
              ['bg-surface', 'surface'],
              ['bg-surface-secondary', 'surface-secondary'],
              ['bg-surface-tertiary', 'surface-tertiary'],
              ['bg-overlay', 'overlay'],
              ['bg-default text-default-foreground', 'default'],
              ['bg-segment text-segment-foreground', 'segment'],
              ['bg-field text-field-foreground', 'field-background'],
            ] as const
          ).map(([cls, label]) => (
            <div
              key={label}
              className={`rounded-lg border border-border p-4 text-sm ${cls}`}
            >
              {label}
            </div>
          ))}
        </div>
        <Card>
          <Card.Header>
            <Card.Title>Card</Card.Title>
            <Card.Description>Card description in the muted color</Card.Description>
          </Card.Header>
          <Card.Content className='text-sm'>Body text on the surface color.</Card.Content>
          <Card.Footer className='flex justify-end gap-2'>
            <Button variant='ghost'>Cancel</Button>
            <Button>Confirm</Button>
          </Card.Footer>
        </Card>
      </Section>

      <Section title='Navigation'>
        <Breadcrumbs>
          <Breadcrumbs.Item href='#'>Home</Breadcrumbs.Item>
          <Breadcrumbs.Item href='#'>Section</Breadcrumbs.Item>
          <Breadcrumbs.Item>Current</Breadcrumbs.Item>
        </Breadcrumbs>
        <Tabs>
          <Tabs.ListContainer>
            <Tabs.List aria-label='Tabs'>
              {['First', 'Second', 'Third'].map(tab => (
                <Tabs.Tab
                  key={tab}
                  id={tab}
                >
                  {tab}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          {['First', 'Second', 'Third'].map(tab => (
            <Tabs.Panel
              key={tab}
              id={tab}
              className='pt-3 text-sm text-muted'
            >
              {tab} panel
            </Tabs.Panel>
          ))}
        </Tabs>
        <Pagination>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous>
                <Pagination.PreviousIcon />
              </Pagination.Previous>
            </Pagination.Item>
            {[1, 2, 3].map(page => (
              <Pagination.Item key={page}>
                <Pagination.Link isActive={page === 2}>{page}</Pagination.Link>
              </Pagination.Item>
            ))}
            <Pagination.Item>
              <Pagination.Next>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
        <div className='flex gap-4 text-sm'>
          <Link href='#'>Link</Link>
          <Link
            href='#'
            isDisabled
          >
            Disabled link
          </Link>
        </div>
      </Section>

      <Section title='Overlays'>
        <div className='flex flex-wrap items-center gap-3'>
          <Tooltip delay={0}>
            <Tooltip.Trigger aria-label='Tooltip'>
              <CircleHelp className='size-5 text-muted' />
            </Tooltip.Trigger>
            <Tooltip.Content>Tooltip content</Tooltip.Content>
          </Tooltip>
          <Popover>
            <Button variant='secondary'>Popover</Button>
            <Popover.Content className='max-w-64'>
              <Popover.Dialog>
                <Popover.Heading>Popover</Popover.Heading>
                <p className='mt-1 text-sm text-muted'>Rendered on the overlay color.</p>
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
          <Dropdown>
            <Dropdown.Trigger className={buttonVariants({variant: 'secondary'})}>Dropdown</Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label='Menu'>
                <Dropdown.Item
                  id='edit'
                  textValue='Edit'
                >
                  <Label>Edit</Label>
                </Dropdown.Item>
                <Dropdown.Item
                  id='delete'
                  textValue='Delete'
                  variant='danger'
                >
                  <Label>Delete</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
          <Modal>
            <Button variant='secondary'>Modal</Button>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog className='sm:max-w-sm'>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>Modal</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className='text-sm text-muted'>Modal body on the overlay color.</Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant='ghost'
                      slot='close'
                    >
                      Cancel
                    </Button>
                    <Button slot='close'>OK</Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </div>
        <Accordion className='max-w-xl'>
          {['First item', 'Second item'].map(item => (
            <Accordion.Item
              key={item}
              id={item}
            >
              <Accordion.Heading>
                <Accordion.Trigger>
                  {item}
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className='text-sm text-muted'>Accordion content</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Section>

      <Section title='Display'>
        <div className='flex flex-wrap items-center gap-3'>
          {COLORS.map(color => (
            <Avatar
              key={color}
              color={color}
            >
              <Avatar.Fallback>{color.slice(0, 2).toUpperCase()}</Avatar.Fallback>
            </Avatar>
          ))}
          <Badge.Anchor>
            <Avatar>
              <Avatar.Fallback>BD</Avatar.Fallback>
            </Avatar>
            <Badge color='danger'>5</Badge>
          </Badge.Anchor>
          <Spinner />
          <Spinner color='success' />
          <Spinner color='danger' />
          <Kbd>
            <Kbd.Abbr keyValue='command' />
            <Kbd.Content>K</Kbd.Content>
          </Kbd>
        </div>
        <div className='flex max-w-md items-center gap-3'>
          <Skeleton className='size-10 rounded-full' />
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-3 w-3/4 rounded' />
            <Skeleton className='h-3 w-1/2 rounded' />
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <p className='text-lg font-semibold'>Foreground heading</p>
          <p className='text-sm text-muted'>Muted supporting text.</p>
        </div>
      </Section>
    </div>
  );
}
