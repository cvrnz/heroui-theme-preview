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
  Table,
  Tabs,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@heroui/react';
import {Bell, CircleHelp, Download, Info, LayoutGrid, Plus, Share2} from 'lucide-react';
import {useState} from 'react';

// ─── Sample data ─────────────────────────────────────────────────────────────

type Status = 'Done' | 'In progress' | 'Review' | 'Blocked';

const STATUS_COLOR: Record<Status, 'success' | 'accent' | 'warning' | 'danger'> = {
  Done: 'success',
  'In progress': 'accent',
  Review: 'warning',
  Blocked: 'danger',
};

const TASKS: {id: string; title: string; owner: string; status: Status; due: string; progress: number}[] = [
  {id: 't1', title: 'Homepage hero redesign', owner: 'Ana Ruiz', status: 'In progress', due: 'Nov 14', progress: 60},
  {id: 't2', title: 'Pricing page copy', owner: 'Ben Okafor', status: 'Review', due: 'Nov 12', progress: 90},
  {id: 't3', title: 'Migrate blog to new CMS', owner: 'Chen Li', status: 'Blocked', due: 'Nov 20', progress: 25},
  {id: 't4', title: 'Accessibility audit', owner: 'Dana Fox', status: 'Done', due: 'Nov 3', progress: 100},
  {id: 't5', title: 'Analytics dashboard', owner: 'Eli Stone', status: 'In progress', due: 'Nov 28', progress: 40},
];

const ACTIVITY = [
  {who: 'Ana Ruiz', what: 'moved Homepage hero redesign to In progress', when: '12 min ago'},
  {who: 'Ben Okafor', what: 'requested review on Pricing page copy', when: '1 h ago'},
  {who: 'Dana Fox', what: 'completed Accessibility audit', when: 'Yesterday'},
];

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('');

// ─── Page sections ───────────────────────────────────────────────────────────

function TopNav() {
  return (
    <header className='sticky top-0 z-10 flex items-center gap-4 border-b border-separator bg-background/80 px-6 py-3 backdrop-blur'>
      <div className='flex items-center gap-2 font-semibold'>
        <LayoutGrid className='size-5 text-accent' />
        Acme
      </div>
      <nav className='hidden items-center gap-4 text-sm md:flex'>
        <Link href='#'>Overview</Link>
        <Link href='#'>Projects</Link>
        <Link href='#'>Team</Link>
      </nav>
      <div className='flex-1' />
      <SearchField
        aria-label='Search'
        className='hidden w-64 sm:block'
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder='Search…' />
          <Kbd className='mr-2'>
            <Kbd.Abbr keyValue='command' />
            <Kbd.Content>K</Kbd.Content>
          </Kbd>
        </SearchField.Group>
      </SearchField>
      <Badge.Anchor>
        <Button
          variant='ghost'
          isIconOnly
          aria-label='Notifications'
        >
          <Bell className='size-4' />
        </Button>
        <Badge
          color='danger'
          size='sm'
        >
          3
        </Badge>
      </Badge.Anchor>
      <Dropdown>
        <Dropdown.Trigger
          aria-label='Account'
          className='rounded-full'
        >
          <Avatar size='sm'>
            <Avatar.Fallback>CH</Avatar.Fallback>
          </Avatar>
        </Dropdown.Trigger>
        <Dropdown.Popover placement='bottom end'>
          <Dropdown.Menu aria-label='Account'>
            <Dropdown.Item
              id='profile'
              textValue='Profile'
            >
              <Label>Profile</Label>
            </Dropdown.Item>
            <Dropdown.Item
              id='settings'
              textValue='Settings'
            >
              <Label>Settings</Label>
            </Dropdown.Item>
            <Dropdown.Item
              id='logout'
              textValue='Sign out'
              variant='danger'
            >
              <Label>Sign out</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </header>
  );
}

function NewTaskModal() {
  return (
    <Modal>
      <Button>
        <Plus className='size-4' />
        New task
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className='sm:max-w-md'>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>New task</Modal.Heading>
            </Modal.Header>
            <Modal.Body className='flex flex-col gap-4'>
              <TextField isRequired>
                <Label>Title</Label>
                <InputGroup>
                  <InputGroup.Input placeholder='What needs doing?' />
                </InputGroup>
              </TextField>
              <TextField>
                <Label>Notes</Label>
                <TextArea placeholder='Add details…' />
              </TextField>
              <PrioritySelect />
              <Checkbox>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label>Notify the team</Label>
                </Checkbox.Content>
              </Checkbox>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='ghost'
                slot='close'
              >
                Cancel
              </Button>
              <Button slot='close'>Create task</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function PrioritySelect() {
  return (
    <Select
      defaultSelectedKey='medium'
      placeholder='Choose priority'
    >
      <Label>Priority</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {['Low', 'Medium', 'High', 'Urgent'].map(p => (
            <ListBox.Item
              key={p}
              id={p.toLowerCase()}
              textValue={p}
            >
              {p}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

function PageHeader() {
  return (
    <div className='flex flex-col gap-4'>
      <Breadcrumbs>
        <Breadcrumbs.Item href='#'>Workspace</Breadcrumbs.Item>
        <Breadcrumbs.Item href='#'>Projects</Breadcrumbs.Item>
        <Breadcrumbs.Item>Website redesign</Breadcrumbs.Item>
      </Breadcrumbs>
      <div className='flex flex-wrap items-center gap-3'>
        <h1 className='text-2xl font-semibold'>Website redesign</h1>
        <Chip
          color='success'
          variant='soft'
        >
          On track
        </Chip>
        <div className='flex-1' />
        <ButtonGroup variant='tertiary'>
          <Button>
            <Share2 className='size-4' />
            Share
          </Button>
          <Button>
            <Download className='size-4' />
            Export
          </Button>
        </ButtonGroup>
        <NewTaskModal />
      </div>
      <p className='max-w-2xl text-sm text-muted'>
        Refresh the marketing site with the new brand, faster pages and an accessible component library.
      </p>
    </div>
  );
}

function Stats() {
  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      <Card>
        <Card.Header>
          <Card.Description>Tasks completed</Card.Description>
          <Card.Title className='text-2xl'>18 / 30</Card.Title>
        </Card.Header>
        <Card.Content>
          <ProgressBar
            value={60}
            aria-label='Tasks completed'
          >
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <Card.Description>Budget used</Card.Description>
          <Card.Title className='text-2xl'>$42,800</Card.Title>
        </Card.Header>
        <Card.Content>
          <Meter
            value={82}
            color='warning'
            aria-label='Budget used'
          >
            <Meter.Track>
              <Meter.Fill />
            </Meter.Track>
          </Meter>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header>
          <Card.Description>Open issues</Card.Description>
          <Card.Title className='flex items-center gap-2 text-2xl'>
            7
            <Chip
              size='sm'
              color='danger'
              variant='soft'
            >
              +2 this week
            </Chip>
          </Card.Title>
        </Card.Header>
        <Card.Content className='flex items-center gap-2 text-sm text-muted'>
          <Spinner size='sm' />
          Syncing with tracker…
        </Card.Content>
      </Card>
    </div>
  );
}

function TasksTab() {
  const [filter, setFilter] = useState('all');
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <SearchField
          aria-label='Filter tasks'
          className='w-56'
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder='Filter tasks' />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <ToggleButtonGroup
          selectionMode='single'
          selectedKeys={[filter]}
          onSelectionChange={keys => setFilter(String([...keys][0] ?? 'all'))}
          aria-label='Task filter'
        >
          <ToggleButton id='all'>All</ToggleButton>
          <ToggleButton id='open'>Open</ToggleButton>
          <ToggleButton id='done'>Done</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label='Tasks'>
            <Table.Header>
              <Table.Column isRowHeader>Task</Table.Column>
              <Table.Column>Owner</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Due</Table.Column>
              <Table.Column>Progress</Table.Column>
            </Table.Header>
            <Table.Body>
              {TASKS.map(task => (
                <Table.Row
                  key={task.id}
                  id={task.id}
                >
                  <Table.Cell className='font-medium'>{task.title}</Table.Cell>
                  <Table.Cell>
                    <span className='flex items-center gap-2 whitespace-nowrap'>
                      <Avatar size='sm'>
                        <Avatar.Fallback>{initials(task.owner)}</Avatar.Fallback>
                      </Avatar>
                      {task.owner}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Chip
                      size='sm'
                      variant='soft'
                      color={STATUS_COLOR[task.status]}
                      className='whitespace-nowrap'
                    >
                      {task.status}
                    </Chip>
                  </Table.Cell>
                  <Table.Cell className='whitespace-nowrap text-muted'>{task.due}</Table.Cell>
                  <Table.Cell>
                    <ProgressBar
                      value={task.progress}
                      size='sm'
                      color={STATUS_COLOR[task.status]}
                      aria-label={`${task.title} progress`}
                      className='w-24'
                    >
                      <ProgressBar.Track>
                        <ProgressBar.Fill />
                      </ProgressBar.Track>
                    </ProgressBar>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <Pagination>
        <Pagination.Summary>Showing 1–5 of 30</Pagination.Summary>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous>
              <Pagination.PreviousIcon />
            </Pagination.Previous>
          </Pagination.Item>
          {[1, 2, 3].map(page => (
            <Pagination.Item key={page}>
              <Pagination.Link isActive={page === 1}>{page}</Pagination.Link>
            </Pagination.Item>
          ))}
          <Pagination.Item>
            <Pagination.Ellipsis />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Link>6</Pagination.Link>
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Next>
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}

function ActivityTab() {
  return (
    <div className='flex flex-col'>
      {ACTIVITY.map((item, i) => (
        <div key={item.what}>
          {i > 0 && <Separator />}
          <div className='flex items-center gap-3 py-3'>
            <Avatar size='sm'>
              <Avatar.Fallback>{initials(item.who)}</Avatar.Fallback>
            </Avatar>
            <p className='flex-1 text-sm'>
              <span className='font-medium'>{item.who}</span> <span className='text-muted'>{item.what}</span>
            </p>
            <span className='text-xs text-muted'>{item.when}</span>
          </div>
        </div>
      ))}
      <Separator />
      {/* Loading placeholder for older activity */}
      <div className='flex items-center gap-3 py-3'>
        <Skeleton className='size-8 rounded-full' />
        <div className='flex flex-1 flex-col gap-2'>
          <Skeleton className='h-3 w-3/4 rounded' />
          <Skeleton className='h-3 w-1/2 rounded' />
        </div>
      </div>
    </div>
  );
}

function SettingsCard() {
  return (
    <Card>
      <Card.Header>
        <Card.Title className='flex items-center gap-2'>
          Project settings
          <Tooltip delay={0}>
            <Tooltip.Trigger aria-label='About settings'>
              <CircleHelp className='size-4 text-muted' />
            </Tooltip.Trigger>
            <Tooltip.Content>Changes apply to everyone on the project</Tooltip.Content>
          </Tooltip>
        </Card.Title>
        <Card.Description>Visible to project admins</Card.Description>
      </Card.Header>
      <Card.Content className='flex flex-col gap-5'>
        <TextField defaultValue='Website redesign'>
          <Label>Project name</Label>
          <InputGroup>
            <InputGroup.Input />
          </InputGroup>
        </TextField>
        <TextField defaultValue='Marketing site refresh for Q4.'>
          <Label>Description</Label>
          <TextArea />
          <Description>Shown on the project card.</Description>
        </TextField>
        <NumberField
          defaultValue={50000}
          step={1000}
          formatOptions={{style: 'currency', currency: 'USD', maximumFractionDigits: 0}}
        >
          <Label>Budget</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <RadioGroup
          defaultValue='team'
          name='visibility'
        >
          <Label>Visibility</Label>
          {[
            ['private', 'Private'],
            ['team', 'Team'],
            ['public', 'Public'],
          ].map(([value, label]) => (
            <Radio
              key={value}
              value={value}
            >
              <Radio.Content>
                <Radio.Control>
                  <Radio.Indicator />
                </Radio.Control>
                <Label>{label}</Label>
              </Radio.Content>
            </Radio>
          ))}
        </RadioGroup>
        <Slider defaultValue={70}>
          <Label>Team capacity</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
        <Switch defaultSelected>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Email notifications</Label>
          </Switch.Content>
        </Switch>
        <Switch>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Label>Weekly digest</Label>
          </Switch.Content>
        </Switch>
      </Card.Content>
      <Card.Footer className='flex items-center justify-between gap-2'>
        <Popover>
          <Button variant='ghost'>
            <Info className='size-4' />
            Details
          </Button>
          <Popover.Content className='max-w-64'>
            <Popover.Dialog>
              <Popover.Heading>Last saved</Popover.Heading>
              <p className='mt-1 text-sm text-muted'>By Ana Ruiz, 2 hours ago.</p>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
        <div className='flex gap-2'>
          <Button variant='outline'>Discard</Button>
          <Button>Save</Button>
        </div>
      </Card.Footer>
    </Card>
  );
}

function Faq() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>FAQ</Card.Title>
      </Card.Header>
      <Card.Content>
        <Accordion>
          {[
            ['Who can see this project?', 'Anyone on the team, unless visibility is set to private.'],
            ['How is progress calculated?', 'From the share of tasks marked done.'],
            ['Can I archive a project?', 'Yes, from the danger zone below.'],
          ].map(([q, a]) => (
            <Accordion.Item
              key={q}
              id={q}
            >
              <Accordion.Heading>
                <Accordion.Trigger>
                  {q}
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className='text-sm text-muted'>{a}</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Content>
    </Card>
  );
}

function DangerZone() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Danger zone</Card.Title>
        <Card.Description>Archiving hides the project from everyone.</Card.Description>
      </Card.Header>
      <Card.Footer className='flex gap-2'>
        <Button variant='danger-soft'>Archive</Button>
        <Button variant='danger'>Delete project</Button>
      </Card.Footer>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

/** A realistic project dashboard built from as many HeroUI components as fit naturally. */
export function DemoPage() {
  return (
    <div className='min-h-full'>
      <TopNav />
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6'>
        <PageHeader />

        <Alert status='warning'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Storage almost full</Alert.Title>
            <Alert.Description>You’ve used 92% of your workspace storage. Upgrade to keep uploading.</Alert.Description>
          </Alert.Content>
          <Button
            size='sm'
            variant='secondary'
          >
            Upgrade
          </Button>
        </Alert>

        <Stats />

        <div className='grid gap-6 lg:grid-cols-[1fr_22rem]'>
          <div className='flex min-w-0 flex-col gap-6'>
            <Tabs>
              <Tabs.ListContainer>
                <Tabs.List aria-label='Project sections'>
                  <Tabs.Tab id='tasks'>
                    Tasks
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id='activity'>
                    Activity
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel
                id='tasks'
                className='pt-4'
              >
                <TasksTab />
              </Tabs.Panel>
              <Tabs.Panel
                id='activity'
                className='pt-4'
              >
                <ActivityTab />
              </Tabs.Panel>
            </Tabs>

            <Card>
              <Card.Header>
                <Card.Title>Recent activity</Card.Title>
              </Card.Header>
              <Card.Content>
                <ActivityTab />
              </Card.Content>
            </Card>

            <Alert status='accent'>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>New: task templates</Alert.Title>
                <Alert.Description>Save any task as a template from its menu.</Alert.Description>
              </Alert.Content>
            </Alert>
          </div>

          <div className='flex flex-col gap-6'>
            <SettingsCard />
            <Faq />
            <DangerZone />
          </div>
        </div>

        <footer className='flex flex-wrap items-center gap-4 border-t border-separator pt-6 text-sm text-muted'>
          <span>© 2026 Acme Inc.</span>
          <div className='flex-1' />
          <Link href='#'>Privacy</Link>
          <Link href='#'>Terms</Link>
          <Link href='#'>Status</Link>
        </footer>
      </div>
    </div>
  );
}
